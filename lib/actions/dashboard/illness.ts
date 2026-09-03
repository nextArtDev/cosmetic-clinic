'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createIllnessSchema } from '@/lib/schemas/dashboard'

// NOTE:
// Your repo snapshot only contains booking/settings actions under
// lib/actions/dashboard/*. In order to keep IllnessForm compiling after the
// UI refactor, this file provides adapters matching the expected API:
// - createIllness(formData, path)
// - editIllness(formData, illnessId, path)
// - deleteIllness(path, illnessId)
//
// If you already have real implementations elsewhere, replace these adapters.

type ActionErrors = Record<string, string[]>

export type IllnessActionState =
  | {
      status: 'idle'
    }
  | {
      status: 'error'
      errors?: ActionErrors
      formError?: string
      fieldErrors?: Record<string, string[]>
    }
  | {
      status: 'success'
    }

function parseMultiValues(formData: FormData, key: string) {
  return formData.getAll(key).filter(Boolean).map(String)
}

function buildPayload(formData: FormData) {
  return {
    name: formData.get('name')?.toString() ?? '',
    description: formData.get('description')?.toString() ?? '',
    specializationId: parseMultiValues(formData, 'specializationId'),
    doctorId: parseMultiValues(formData, 'doctorId'),
    // Keep files as-is for server-side upload validation.
    images: formData.getAll('images'),
  }
}

export async function createIllness(formData: FormData, path: string) {
  const payload = buildPayload(formData)
  const parsed = createIllnessSchema.safeParse(payload)

  if (!parsed.success) {
    const flattened = parsed.error.flatten()
    const errors: ActionErrors = {}
    for (const [k, v] of Object.entries(flattened.fieldErrors)) {
      if (v && v.length) errors[k] = v
    }
    return { status: 'error' as const, errors } satisfies IllnessActionState
  }

  // Real DB write should happen here.
  // Keeping adapter minimal to unblock UI; replace with your actual prisma logic.
  revalidatePath(path)
  return { status: 'success' as const } satisfies IllnessActionState
}

export async function editIllness(
  formData: FormData,
  illnessId: string,
  path: string,
) {
  // Validating like create; then update DB in real impl.
  const payload = buildPayload(formData)
  const parsed = createIllnessSchema.safeParse(payload)

  if (!parsed.success) {
    const flattened = parsed.error.flatten()
    const errors: ActionErrors = {}
    for (const [k, v] of Object.entries(flattened.fieldErrors)) {
      if (v && v.length) errors[k] = v
    }
    return { status: 'error' as const, errors } satisfies IllnessActionState
  }

  revalidatePath(path)
  return { status: 'success' as const } satisfies IllnessActionState
}

export async function deleteIllness(path: string, illnessId: string) {
  // Real deletion should happen here.
  revalidatePath(path)
  return { status: 'success' as const } satisfies IllnessActionState
}
