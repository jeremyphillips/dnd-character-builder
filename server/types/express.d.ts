declare namespace Express {
  interface Request {
    userId?: string
    userRole?: 'superadmin' | 'admin' | 'user'
  }
}
