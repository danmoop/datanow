import type { Context } from 'hono'
import { ObjectId } from 'mongodb'
import { UserModel } from '../../model/user'
import { sign } from 'hono/jwt'
import { AppError } from '../../errors'

export const AuthModule = {
  registerUser: async (c: Context): Promise<void> => {
    const body = await c.req.json()

    if (!body.email || !body.password) {
      throw new AppError(400, 'Email and password are required')
    }

    const existingUser = await UserModel.findOne({ email: body.email })
    if (existingUser) {
      throw new AppError(400, 'User already exists')
    }

    const bcryptHash = await Bun.password.hash(body.password, {
      algorithm: 'bcrypt',
      cost: 10
    })

    const user = new UserModel({
      email: body.email,
      password: bcryptHash
    })
    await user.save()
  },

  loginUser: async (c: Context): Promise<string> => {
    const body = await c.req.json()

    if (!body.email || !body.password) {
      throw new AppError(400, 'Email and password are required')
    }

    const user = await UserModel.findOne({ email: body.email }).lean()
    if (!user) {
      throw new AppError(401, 'Invalid email or password')
    }

    const isMatch = await Bun.password.verify(body.password, user.password)
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password')
    }

    const now = Math.floor(Date.now() / 1000)
    return sign(
      {
        id: user._id,
        email: user.email,
        isPremium: user.isPremium,
        iat: now,
        exp: now + 60 * 60
      },
      process.env.JWT_SECRET as string
    )
  },

  buyPremium: async (userId: string): Promise<void> => {
    const userDB = await UserModel.findOne({ _id: new ObjectId(userId) })
    if (userDB) {
      throw new AppError(404, 'User not found')
    }

    await UserModel.findByIdAndUpdate(userId, { isPremium: true })
  }
}
