import { Schema, model } from 'mongoose'
import { fileUploadSchema, type FileUpload } from './fileUpload'

export interface User {
  email: string
  password: string
  createdAt: Date
  isPremium: boolean
  premiumExpiresAt?: Date
  fileUploads?: FileUpload[]
}

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  fileUploads: {
    type: [fileUploadSchema],
    default: []
  }
})

export const UserModel = model('User', userSchema)
