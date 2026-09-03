export type DoctorActionState = {
  status: 'idle' | 'error'
  /** keyed by form field name — the client maps these onto RHF via setError */
  fieldErrors?: Record<string, string[]>
  formError?: string
}

export const DOCTOR_ACTION_IDLE: DoctorActionState = { status: 'idle' }

export type PersonnelActionState = {
  status: 'idle' | 'error'
  /** keyed by form field name — the client maps these onto RHF via setError */
  fieldErrors?: Record<string, string[]>
  formError?: string
}

export const PERSONNEL_ACTION_IDLE: PersonnelActionState = { status: 'idle' }

export type UserActionState = {
  status: 'idle' | 'error'
  /** keyed by form field name — the client maps these onto RHF via setError */
  fieldErrors?: Record<string, string[]>
  formError?: string
}

export const USER_ACTION_IDLE: UserActionState = { status: 'idle' }

export type TimelineActionState = {
  status: 'idle' | 'error'
  fieldErrors?: Record<string, string[]>
  formError?: string
}

export const TIMELINE_ACTION_IDLE: TimelineActionState = { status: 'idle' }
