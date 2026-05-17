import { Hono } from 'hono'
import type { AppEnv } from '../../types'
import { FileModule } from './module'
import { authMiddleware } from '../../middleware/auth'
import { AppError } from '../../errors'

const app = new Hono<AppEnv>()

app.post('/upload', authMiddleware, async (c) => {
  const formData = await c.req.formData()

  await FileModule.upload(c, formData)

  return c.json({ message: 'File uploaded successfully' })
})

app.get('/exists/:filename', authMiddleware, async (c) => {
  const { filename } = c.req.param()
  if (!filename) {
    throw new AppError(400, 'Filename is required')
  }

  const exists = await FileModule.exists(filename)
  return c.json({ exists })
})

app.get('/download', authMiddleware, async (c) => {
  const { key } = c.req.query()

  if (!key) {
    throw new AppError(400, 'Storage key is required')
  }

  const file = await FileModule.download(c, key)
  return c.body(file.stream(), 200, {
    'Content-Type': file.type,
    'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`
  })
})

app.delete('/', authMiddleware, async (c) => {
  const { key } = c.req.query()
  if (!key) {
    throw new AppError(400, 'Storage key is required')
  }

  await FileModule.delete(c, key)
  return c.json({ message: 'File deleted successfully' })
})

export default app
