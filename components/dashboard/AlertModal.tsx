'use client'

import { useEffect, useState } from 'react'

// import { useFormStatus } from 'react-dom'

import { toast } from 'sonner'

import { SubmitButton } from '../shared/SubmitButton'
import { Modal } from './modal'

interface DeleteStoreFormState {
  errors: {
    name?: string[]
    // description?: string[]
    _form?: string[]
  }
}
interface AlertModalProps {
  isOpen: boolean
  isPending?: boolean
  onClose: () => void
  onConfirm: (payload: FormData) => void
  formState?: DeleteStoreFormState
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formState,
  // isPending,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  // const { pending } = useFormStatus()

  useEffect(() => {
    if (formState?.errors?._form) {
      toast.error(formState.errors._form?.join(' و '))
    }
  }, [formState])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <Modal
      title="آیا مطمئن هستید؟"
      description="این عملیات برگشت پذیر نیست!"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className=" pt-6 gap-2 flex items-center justify-start w-full">
        <form action={onConfirm}>
          <SubmitButton variant="destructive">ادامه</SubmitButton>
        </form>
        {/* <Button disabled={isPending} variant="outline" onClick={onClose}>
          انصراف
        </Button> */}
      </div>
    </Modal>
  )
}
