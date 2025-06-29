import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle, Clock, Play, Check, X, AlertCircle } from 'lucide-react'
import type { BookingStatus } from '@/types'

interface StatusBadgeProps {
  status: BookingStatus
  className?: string
  showIcon?: boolean
}

const statusConfig = {
  PENDING_CONFIRMATION: {
    variant: 'warning' as const,
    icon: Clock,
    label: 'Pending Confirmation'
  },
  CONFIRMED: {
    variant: 'default' as const,
    icon: CheckCircle,
    label: 'Confirmed'
  },
  COMPLETED: {
    variant: 'success' as const,
    icon: Check,
    label: 'Completed'
  },
  CANCELLED: {
    variant: 'error' as const,
    icon: X,
    label: 'Cancelled'
  },
  DECLINED: {
    variant: 'error' as const,
    icon: AlertCircle,
    label: 'Declined'
  }
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge
      variant={config.variant}
      className={cn('flex items-center gap-1', className)}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

export default StatusBadge
