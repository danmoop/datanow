import type { Context, Next } from 'hono'
import { AppError } from '../errors'

export const paymentMiddleware = async (
  c: Context,
  next: Next
): Promise<void> => {
  const signature = c.req.header('x-pay-signature')

  if (!signature) {
    throw new AppError(400, 'Payment signature is required')
  }

  if (signature !== process.env.PAYMENT_SIGNATURE) {
    throw new AppError(400, 'Invalid payment signature')
  }

  return await next()
}
