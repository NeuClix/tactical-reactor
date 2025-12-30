'use client'

import { useState, useCallback } from 'react'

interface UseFormDataOptions<T> {
  initialValues: T
  onSubmit?: (values: T) => Promise<void> | void
}

interface UseFormDataReturn<T> {
  values: T
  initialValues: T
  isDirty: boolean
  isSubmitting: boolean
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void
  setValues: (values: Partial<T>) => void
  reset: (newInitialValues?: T) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
}

export function useFormData<T extends object>({
  initialValues,
  onSubmit,
}: UseFormDataOptions<T>): UseFormDataReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues)
  const [savedInitialValues, setSavedInitialValues] = useState<T>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDirty = JSON.stringify(values) !== JSON.stringify(savedInitialValues)

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [field]: value }))
  }, [])

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }))
  }, [])

  const reset = useCallback((newInitialValues?: T) => {
    const resetValues = newInitialValues ?? savedInitialValues
    setValuesState(resetValues)
    if (newInitialValues) {
      setSavedInitialValues(newInitialValues)
    }
  }, [savedInitialValues])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!onSubmit || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(values)
      setSavedInitialValues(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, values, isSubmitting])

  return {
    values,
    initialValues: savedInitialValues,
    isDirty,
    isSubmitting,
    setFieldValue,
    setValues,
    reset,
    handleSubmit,
  }
}
