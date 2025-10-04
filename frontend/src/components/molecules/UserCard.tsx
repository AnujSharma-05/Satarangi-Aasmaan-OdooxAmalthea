import React from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import { cn } from '@/lib/utils'

export interface UserCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  email: string
  avatarSrc?: string
  role?: string
}

const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  ({ className, name, email, avatarSrc, role, ...props }, ref) => {
    return (
      <div
        className={cn('flex items-center space-x-3', className)}
        ref={ref}
        {...props}
      >
        <Avatar name={name} src={avatarSrc} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          <span className="text-xs text-muted-foreground">{email}</span>
          {role && (
            <span className="text-xs text-muted-foreground capitalize">
              {role}
            </span>
          )}
        </div>
      </div>
    )
  }
)
UserCard.displayName = 'UserCard'

export { UserCard }