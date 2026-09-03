'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { FileInput, FileUploader } from './file-upload'
import { cn } from '@/lib/utils'
import ImageSlider from '../ImageSlider'
import { Image } from '@/lib/generated/prisma'

interface InputFileUploadProps {
  name: string
  label?: string
  className?: string
  multiple?: boolean
  initialDataImages?: Partial<Image>[] | null
  unoptimized?: boolean
}

const InputFileUpload = ({
  name,
  label = name,
  className,
  multiple = true,
  initialDataImages,
  unoptimized = false,
}: InputFileUploadProps) => {
  const form = useFormContext()
  const [files, setFiles] = useState<File[] | null>(null)
  const [initials, setClearInitials] = useState(true)

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: multiple,
  }

  const initialUrls = initialDataImages
    ?.map((img) => img.url)
    .filter(Boolean) as string[]
  const urls = files
    ?.map((file: Blob | MediaSource) => URL.createObjectURL(file))
    .filter(Boolean) as string[]

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">{label}</label>

          <div className="relative">
            <FileUploader
              value={field.value}
              onValueChange={field.onChange}
              onChange={async (event) => {
                const dataTransfer = new DataTransfer()
                if (files) {
                  Array.from(files).forEach((image) =>
                    dataTransfer.items.add(image),
                  )
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                Array.from(event.target.files! as File[]).forEach(
                  (image: File) => dataTransfer.items.add(image),
                )
                const newFiles = dataTransfer.files
                setFiles(Array.from(newFiles))
              }}
              dropzoneOptions={dropZoneConfig}
              className="relative bg-background rounded-lg p-2"
            >
              {!!initialUrls?.length && !!initials ? (
                <div className={cn('relative w-60 h-60 ', className)}>
                  <ImageSlider unoptimized={unoptimized} urls={initialUrls} />
                  <Button
                    size="icon"
                    onClick={() => {
                      setFiles(null)
                      form.setValue(name, []) // Set to empty array instead of null
                      setClearInitials(false)
                    }}
                    className="absolute top-2 left-2 z-20"
                    type="button"
                  >
                    <X className="text-blue-500" />
                  </Button>
                </div>
              ) : files && files.length > 0 ? (
                <div className={cn('relative w-60 h-60 ', className)}>
                  <ImageSlider unoptimized={unoptimized} urls={urls} />
                  <Button
                    size="icon"
                    onClick={() => {
                      setFiles(null)
                      form.setValue(name, [])
                      setClearInitials(false)
                    }}
                    className="absolute top-2 left-2 z-20"
                    type="button"
                  >
                    <X className="text-red-500" />
                  </Button>
                </div>
              ) : (
                <FileInput className="outline-dashed outline-1 outline-foreground p-5">
                  <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
                    <FileSvgDraw />
                  </div>
                </FileInput>
              )}
            </FileUploader>
          </div>

          {/* Error Message Native Rendering */}
          {fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}

export default InputFileUpload

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">برای اپلود عکس کلید کرده</span>
        &nbsp; یا عکس را گرفته در این محل رها کنید
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG یا GIF
      </p>
    </>
  )
}
