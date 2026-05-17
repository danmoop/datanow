import * as fs from 'fs'
import { ObjectId } from 'mongodb'
import { type Context } from 'hono'
import { extractText } from 'unpdf'
import { UserModel } from '../../model/user'
import { AppError } from '../../errors'
import { FileModule } from '../files/module'
import { FileUploadModel } from '../../model/fileUpload'
import { AnalyzeFileCache } from '../../cache/AnalyzeFileCache'
import { analyzeRateLimiter } from '../../middleware/analyzeRateLimiter'
import { TrendsFileCache } from '../../cache/TrendsFileCache'
import s3 from '../../files/s3'

const SUMMARY_PROMPT = fs.readFileSync('src/prompts/summarize.md', 'utf-8')
const TRENDS_PROMPT = fs.readFileSync('src/prompts/trends.md', 'utf-8')

const LLM_API_URL = process.env.OLLAMA_URL
const LLM_MODEL = process.env.OLLAMA_MODEL

type OllamaResponse = { message?: { content?: string } }

type FileResolution = {
  fileContents: string | object
  extension: string
}

async function callLLM(
  systemPrompt: string,
  userContent: string
): Promise<OllamaResponse> {
  if (!LLM_API_URL) {
    throw new AppError(400, 'OLLAMA_URL env variable not set up')
  }

  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: LLM_MODEL,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ]
    })
  })
  return response.json() as Promise<OllamaResponse>
}

async function resolveFile(c: Context, key: string): Promise<FileResolution> {
  const user = c.var.user
  const userDB = await UserModel.findOne({ _id: new ObjectId(user.id) })

  if (!userDB) {
    throw new AppError(404, 'User not found')
  }
  if (!(await FileModule.exists(key))) {
    throw new AppError(404, 'File not found')
  }

  const fileDB = await FileUploadModel.findOne({ storageKey: key }).lean()
  if (!fileDB) {
    throw new AppError(404, 'File not found')
  }
  if (fileDB.userId.toString() !== user.id) {
    throw new AppError(403, 'You do not have permission to analyze this file')
  }

  const extension = key.split('.').pop()?.toLowerCase()
  let fileContents: string | object

  if (extension === 'json') {
    fileContents = await s3.file(key).json()
  } else if (extension === 'csv') {
    fileContents = await s3.file(key).text()
  } else if (extension === 'pdf') {
    const buffer = await s3.file(key).arrayBuffer()
    const { text } = await extractText(new Uint8Array(buffer))
    fileContents = text.join('\n')
  } else {
    throw new AppError(400, 'Unsupported file type')
  }

  return { fileContents, extension }
}

export const AnalyzeModule = {
  analyze: async (c: Context, key: string): Promise<OllamaResponse> => {
    const cachedValue = await AnalyzeFileCache.get(key)

    if (cachedValue) {
      return JSON.parse(cachedValue)
    }

    // Rate limit analyze requests for free users if the result is not cached
    await analyzeRateLimiter(c)

    const { fileContents } = await resolveFile(c, key)
    const response = await callLLM(
      SUMMARY_PROMPT,
      JSON.stringify({ fileContents })
    )

    await AnalyzeFileCache.set(key, JSON.stringify(response))

    return response
  },

  trends: async (c: Context, key: string): Promise<OllamaResponse> => {
    const cachedValue = await TrendsFileCache.get(key)

    if (cachedValue) {
      return JSON.parse(cachedValue)
    }

    // Rate limit analyze requests for free users if the result is not cached
    await analyzeRateLimiter(c)

    const { fileContents, extension } = await resolveFile(c, key)
    if (extension !== 'csv') {
      throw new AppError(400, 'Trends analysis is only available for CSV files')
    }

    const response = await callLLM(
      TRENDS_PROMPT,
      JSON.stringify({ fileContents })
    )
    await TrendsFileCache.set(key, JSON.stringify(response))
    return response
  }
}
