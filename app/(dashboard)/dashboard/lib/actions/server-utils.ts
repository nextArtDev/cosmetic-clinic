import { uploadFileLocally } from './localUpload'
import sharp from 'sharp'

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploads = files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer())
    const webp = await sharp(buffer).webp({ effort: 6 }).toBuffer()
    const res = await uploadFileLocally(
      webp,
      file.name.replace(/\.[^/.]+$/, ''),
    )
    return typeof res?.imageId === 'string' ? res.imageId : null
  })
  return (await Promise.all(uploads)).filter((id): id is string => id !== null)
}
