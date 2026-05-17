import { S3Client } from 'bun'

class S3 {
  private static instance: S3Client
  private constructor() {}

  static getInstance(): S3Client {
    if (!S3.instance) {
      S3.instance = new S3Client({
        endpoint: process.env.MINIO_ENDPOINT,
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
        bucket: process.env.MINIO_BUCKET,
        region: process.env.MINIO_REGION
      })
    }
    return S3.instance
  }
}

const s3 = S3.getInstance()
export default s3
