import React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children?: React.ReactNode
  className?: string
}

export interface InputFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'>,
    FormFieldProps {}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, children, className, ...props }, ref) => {
    return (
      <div className={cn('space-y-2', className)} ref={ref}>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {children}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className, ...props }, ref) => {
    return (
      <FormField label={label} error={error} required={required} className={className}>
        <Input ref={ref} {...props} />
      </FormField>
    )
  }
)
InputField.displayName = 'InputField'

export { FormField, InputField }