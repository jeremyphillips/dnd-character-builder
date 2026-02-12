import type { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOADS_DIR = path.resolve(__dirname, '../../assets/uploads')

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export async function uploadImage(req: Request, res: Response) {
  try {
    const contentType = req.headers['content-type'] ?? ''

    if (!contentType.startsWith('image/')) {
      res.status(400).json({ error: 'Only image files are accepted' })
      return
    }

    // req.body is a Buffer from express.raw({ type: 'image/*' })
    const buffer = req.body as Buffer

    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      res.status(400).json({ error: 'Empty file' })
      return
    }

    // Determine extension from content-type
    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    }
    const ext = extMap[contentType] ?? '.png'

    // Generate a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filepath = path.join(UPLOADS_DIR, filename)

    fs.writeFileSync(filepath, buffer)

    const url = `/uploads/${filename}`
    res.status(201).json({ url, filename })
  } catch (err) {
    console.error('Upload failed:', err)
    res.status(500).json({ error: 'Upload failed' })
  }
}
