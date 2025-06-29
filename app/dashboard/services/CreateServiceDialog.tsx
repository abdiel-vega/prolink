'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ServiceForm } from '@/app/dashboard/services/ServiceForm'
import { Plus } from 'lucide-react'

interface CreateServiceDialogProps {
  children: React.ReactNode
}

export function CreateServiceDialog({ children }: CreateServiceDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Service</DialogTitle>
        </DialogHeader>
        <ServiceForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
