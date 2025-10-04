import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statusChipVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      status: {
        pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        approved: 'bg-green-100 text-green-800 border border-green-200',
        rejected: 'bg-red-100 text-red-800 border border-red-200',
        draft: 'bg-gray-100 text-gray-800 border border-gray-200',
        'waiting-approval': 'bg-blue-100 text-blue-800 border border-blue-200',
      },
    },
    defaultVariants: {
      status: 'pending',
    },
  }
)

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'waiting-approval'
}

const StatusChip = React.forwardRef<HTMLSpanElement, StatusChipProps>(
  ({ className, status, children, ...props }, ref) => {
    const displayText = children || status.replace('-', ' ').toUpperCase()
    
    return (
      <span
        className={cn(statusChipVariants({ status, className }))}
        ref={ref}
        {...props}
      >
        {displayText}
      </span>
    )
  }
)
StatusChip.displayName = 'StatusChip'

export { StatusChip }