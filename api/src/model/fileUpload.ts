import { model, Schema, type ObjectId } from 'mongoose'

export interface FileUpload {
  userId: ObjectId
  filename: string
  fileType: 'csv' | 'pdf' | 'json'
  storageKey: string
  fileSizeBytes: number
  uploadedAt: Date
}

export const fileUploadSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  fileType: { type: String, enum: ['csv', 'pdf', 'json'], required: true },
  storageKey: { type: String, required: true },
  fileSizeBytes: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now }
})

export const FileUploadModel = model('FileUpload', fileUploadSchema)
