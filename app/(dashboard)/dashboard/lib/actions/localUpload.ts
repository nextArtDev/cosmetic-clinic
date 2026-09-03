import prisma from '@/lib/prisma'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

// ✅ Static subfolder anchors Turbopack's trace to public/uploads only
const UPLOAD_SUBDIR = 'public/uploads'

function getUploadDir(): string {
  // Resolved lazily inside functions, not at module evaluation time
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), UPLOAD_SUBDIR)
}

async function ensureUploadDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directory:', error)
  }
}

function sanitizeFileName(input: string): string {
  let safe = input.replace(/[\/\\\0]/g, '_')
  safe = safe.replace(/[^\p{L}\p{N}\-_.]/gu, '_')
  safe = safe.replace(/_+/g, '_').replace(/^_|_$/g, '')
  if (!safe) safe = 'file'
  return safe
}

export async function uploadFileLocally(
  fileBuffer: Buffer,
  originalName: string,
): Promise<{ imageId: string; imageKey: string; imageUrl: string } | null> {
  if (!fileBuffer || !originalName) return null

  const uploadDir = getUploadDir()
  await ensureUploadDir(uploadDir)

  const baseName = originalName.replace(/\.[^/.]+$/, '')
  const safeBase = sanitizeFileName(baseName)
  const fileName = `${safeBase}-${randomUUID()}.webp`
  // ✅ Static prefix keeps Turbopack's trace scoped
  const filePath = path.join(process.cwd(), UPLOAD_SUBDIR, fileName)

  try {
    await fs.writeFile(filePath, fileBuffer)
    const url = `/uploads/${fileName}`
    const image = await prisma.image.create({
      data: { key: fileName, url },
    })
    if (!image) return null
    return {
      imageId: image.id,
      imageKey: image.key,
      imageUrl: image.url,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deleteFileLocally(
  key: string,
): Promise<{ success: boolean }> {
  // ✅ Static prefix here too
  const filePath = path.join(process.cwd(), UPLOAD_SUBDIR, key)

  try {
    await fs.unlink(filePath).catch((err) => {
      if (err.code !== 'ENOENT') throw err
    })
    await prisma.image.deleteMany({ where: { key } })
    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}
