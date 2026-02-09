import type { Request, Response } from 'express'
import * as userService from '../services/user.service'

const VALID_ROLES = ['superadmin', 'admin', 'user'] as const

export async function getUsers(_req: Request, res: Response) {
  const users = await userService.getAllUsers()
  res.json({ users })
}

export async function getUser(req: Request, res: Response) {
  const user = await userService.getUserById(req.params.id)

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({ user })
}

export async function updateRole(req: Request, res: Response) {
  const { role } = req.body

  if (!role || !VALID_ROLES.includes(role)) {
    res.status(400).json({ error: `Role must be one of: ${VALID_ROLES.join(', ')}` })
    return
  }

  const user = await userService.updateUserRole(req.params.id, role)

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  res.json({ user })
}
