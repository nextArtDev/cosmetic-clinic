'use client'

// components/dashboard/file-upload/image-upload-field.tsx
// The modern InputFileUpload.
//
// What changed vs. the old component:
//   useFormContext() (hidden coupling)      -> `control` passed as a prop; the
//                                              field is generic over the form type
//   parallel useState<File[]> + form value  -> field.value IS the single source
//                                              of truth (no drift possible)
//   URL.createObjectURL never revoked       -> revoked in a useEffect cleanup

//   "clear all" nuked initial + new images  -> per-image remove; kept ids are
//                                              tracked in a separate keepImageIds
//                                              field so edits never re-upload
//   naked <label> + manual error <p>        -> Field/FieldLabel/FieldError
//   raw <svg> dropzone art                  -> lucide icons

import { useEffect, useMemo } from 'react'
import {
  Controller,
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { CloudUpload, X } from 'lucide-react'
import NextImage from 'next/image'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'

import { cn } from '@/lib/utils'
import {
  FileInput,
  FileUploader,
} from '@/components/dashboard/file-upload/file-upload'

interface ExistingImage {
  id: string
  url: string
}

interface ImageUploadFieldProps<T extends FieldValues> {
  control: Control<T>
  /** field holding NEW File[] uploads */
  name: FieldPath<T>
  /** field holding string[] ids of existing images to keep */
  keepName: FieldPath<T>
  label?: string
  existingImages?: ExistingImage[]
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export default function ImageUploadField<T extends FieldValues>({
  control,
  name,
  keepName,
  label = 'تصاویر',
  existingImages = [],
  maxFiles = 5,
  disabled = false,
  className,
}: ImageUploadFieldProps<T>) {
  // keepImageIds is managed alongside the files field.
  const { field: keepField } = useController({ control, name: keepName })
  const keptIds: string[] = keepField.value ?? []
  const keptImages = existingImages.filter((img) => keptIds.includes(img.id))

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const files: File[] = field.value ?? []
        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            <FieldLabel htmlFor={`${name}-uploader`}>{label}</FieldLabel>

            <FileUploader
              value={files}
              onValueChange={(next: File[] | null) =>
                field.onChange(next ?? [])
              }
              dropzoneOptions={{
                maxFiles,
                maxSize: 4 * 1024 * 1024,
                multiple: true,
                accept: {
                  'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
                },
                disabled,
              }}
              className="relative rounded-lg bg-background p-2"
            >
              <FileInput
                id={`${name}-uploader`}
                className="p-5 outline-dashed outline-1 outline-foreground/40"
              >
                <div className="flex w-full flex-col items-center justify-center gap-1 pb-4 pt-3 text-muted-foreground">
                  <CloudUpload className="mb-2 size-8" aria-hidden />
                  <p className="text-sm">
                    <span className="font-semibold">
                      برای آپلود عکس کلیک کنید
                    </span>
                    &nbsp;یا عکس را در این محل رها کنید
                  </p>
                  <p className="text-xs">
                    PNG، JPG، WEBP یا GIF — حداکثر ۴ مگابایت
                  </p>
                </div>
              </FileInput>
            </FileUploader>

            {(keptImages.length > 0 || files.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-3">
                {keptImages.map((img) => (
                  <Thumb
                    key={img.id}
                    src={img.url}
                    disabled={disabled}
                    onRemove={() =>
                      keepField.onChange(keptIds.filter((id) => id !== img.id))
                    }
                  />
                ))}
                {files.map((file, i) => (
                  <FileThumb
                    key={`${file.name}-${file.lastModified}`}
                    file={file}
                    disabled={disabled}
                    onRemove={() =>
                      field.onChange(files.filter((_, j) => j !== i))
                    }
                  />
                ))}
              </div>
            )}

            <FieldDescription>حداکثر {maxFiles} تصویر.</FieldDescription>
            {fieldState.error && (
              <FieldError>{fieldState.error.message}</FieldError>
            )}
          </Field>
        )
      }}
    />
  )
}

// ---------------------------------------------------------------------------

function Thumb({
  src,
  onRemove,
  disabled,
}: {
  src: string
  onRemove: () => void
  disabled: boolean
}) {
  return (
    <div className="relative size-28 overflow-hidden rounded-md border">
      <NextImage src={src} alt="" fill unoptimized className="object-cover" />
      <Button
        type="button"
        size="icon"
        variant="secondary"
        disabled={disabled}
        onClick={onRemove}
        aria-label="حذف تصویر"
        className={cn('absolute left-1 top-1 z-10 size-6')}
      >
        <X className="size-3.5" />
      </Button>
    </div>
  )
}

/** New uploads: object URL created once per File and revoked on unmount. */
function FileThumb({
  file,
  onRemove,
  disabled,
}: {
  file: File
  onRemove: () => void
  disabled: boolean
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return <Thumb src={url} onRemove={onRemove} disabled={disabled} />
}
