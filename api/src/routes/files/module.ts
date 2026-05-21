import type { Context } from 'hono'
import mongoose from 'mongoose'
import { ObjectId } from 'mongodb'
import { randomUUIDv7, type S3File } from 'bun'
import { UserModel } from '../../model/user'
import { FileUploadModel } from '../../model/fileUpload'
import { AppError } from '../../errors'
import s3 from '../../files/s3'

export const FileModule = {
  upload: async (c: Context, formData: FormData): Promise<void> => {
    const file = formData.get('file') as File
    const size = file.size
    const { id } = c.var.user

    const userDB = await UserModel.findOne({ _id: new ObjectId(id) }).lean()

    if (!userDB) {
      throw new AppError(404, 'User not found')
    }

    if (!userDB.isPremium && size > 5 * 1024 * 1024) {
      throw new AppError(400, 'File size exceeds the 5MB limit for free users')
    }

    if (size > 50 * 1024 * 1024) {
      throw new AppError(400, 'File size exceeds the 50MB limit')
    }

    const userId = c.var.user.id
    const fileId = randomUUIDv7()
    const ext = file.name.split('.').pop()
    const storageKey = `${userId}/${fileId}.${ext}`

    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        const s3file = s3.file(storageKey)
        await s3file.write(await file.arrayBuffer(), { type: file.type })

        const fileUpload = {
          userId: new ObjectId(userId),
          filename: file.name,
          fileType: ext,
          storageKey,
          fileSizeBytes: file.size,
          uploadedAt: new Date()
        }

        await UserModel.findByIdAndUpdate(
          {
            _id: new ObjectId(userId)
          },
          {
            $push: {
              fileUploads: fileUpload
            }
          },
          { session }
        )

        const upload = new FileUploadModel(fileUpload)
        await upload.save({ session })
      })
    } catch (err) {
      await s3.delete(storageKey)
      throw err
    } finally {
      await session.endSession()
    }
  },

  download: async (c: Context, storageKey: string): Promise<S3File> => {
    const userId = c.var.user.id

    if (!(await FileModule.exists(storageKey))) {
      throw new AppError(404, 'File does not exist')
    }

    const dbUpload = await FileUploadModel.findOne({ storageKey })

    if (!dbUpload) {
      throw new AppError(404, 'File metadata not found in database')
    }

    if (dbUpload.userId.toString() !== userId) {
      throw new AppError(403, 'Unauthorized to download this file')
    }

    const fileStream = await s3.file(storageKey)
    c.header(
      'Content-Disposition',
      `attachment; filename="${dbUpload.filename}"`
    )
    c.header('Content-Type', 'application/octet-stream')

    return fileStream
  },

  delete: async (c: Context, storageKey: string): Promise<void> => {
    const userId = c.var.user.id

    if (!(await FileModule.exists(storageKey))) {
      throw new AppError(404, 'File does not exist')
    }

    const dbUpload = await FileUploadModel.findOne({ storageKey })

    if (!dbUpload) {
      throw new AppError(404, 'File metadata not found in database')
    }

    if (dbUpload.userId.toString() !== userId) {
      throw new AppError(403, 'Unauthorized to delete this file')
    }

    const session = await mongoose.startSession()

    try {
      await session.withTransaction(async () => {
        await FileUploadModel.deleteOne({ storageKey }, { session })
        await UserModel.findByIdAndUpdate(
          { _id: new ObjectId(userId) },
          { $pull: { fileUploads: { storageKey } } },
          { session }
        )

        await s3.delete(storageKey)
      })
    } finally {
      await session.endSession()
    }
  },

  exists: async (filename: string): Promise<boolean> => {
    return s3.exists(filename)
  }
}
