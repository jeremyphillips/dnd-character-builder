// server/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const app = express();

// 1. MUST BE FIRST: Standard CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Add a manual preflight handler if Express 5 is still being picky
app.options('/*', (req, res) => {
  res.sendStatus(200);
});

// 3. Body parsers come AFTER cors
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 5000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        // model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      })
    });

    // If the request to OpenAI failed (e.g., 403)
    if (!response.ok) {
// console.log('OpenAI Error Details:', response)
      const errorData = await response.json().catch(() => ({})); 
      console.error('--- OPENAI ERROR DETECTED ---');
      console.error('Status:', response.status);
      console.error('Body:', JSON.stringify(errorData, null, 2));
      console.error('-----------------------------');
      
      // Send the actual status back to your frontend to debug
      return res.status(response.status).json({
        error: 'OpenAI API Error',
        details: errorData
      });
    }

    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error('Local Server Error:', err);
    res.status(500).json({ error: 'Something went wrong on the local server' });
  }
})
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
