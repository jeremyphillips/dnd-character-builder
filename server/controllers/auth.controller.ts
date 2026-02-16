import type { Request, Response } from 'express'
import { loginUser, getUserById, updateProfile } from '../services/auth.service'
import { setTokenCookie, clearTokenCookie } from '../utils/cookies'
import { verifyToken } from '../utils/jwt'

export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const result = await loginUser(email, password)

  if (!result) {
    res.status(401).json({ error: 'Invalid credentials' })
    return
  }

  setTokenCookie(res, result.token)
  res.json({ user: result.user })
}

export async function logout(_req: Request, res: Response) {
  clearTokenCookie(res)
  res.json({ message: 'Logged out' })
}

export async function getMe(req: Request, res: Response) {
  const token = req.cookies?.token

  if (!token) {
    res.json({ user: null })
    return
  }

  try {
    const payload = verifyToken(token)
    const user = await getUserById(payload.userId)

    if (!user) {
      res.json({ user: null })
      return
    }

    res.json({ user })
  } catch {
    res.json({ user: null })
  }
}

export async function updateMe(req: Request, res: Response) {
  if (!req.userId) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  const {
    firstName, lastName, username, avatarKey,
    bio, website, email, notificationPreferences,
  } = req.body

  try {
    const user = await updateProfile(req.userId, {
      firstName, lastName, username, avatarKey,
      bio, website, email, notificationPreferences,
    })
    res.json({ user })
  } catch (err) {
    console.error('Failed to update profile:', err)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

/** Returns the token for Socket.io auth. Client must call with credentials. */
export async function getSocketToken(req: Request, res: Response) {
  const token = req.cookies?.token

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' })
    return
  }

  try {
    verifyToken(token)
    res.json({ token })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}
