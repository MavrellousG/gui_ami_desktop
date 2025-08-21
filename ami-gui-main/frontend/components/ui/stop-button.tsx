'use client'

import { useState } from "react"
import { StopCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface StopButtonProps {
  className?: string
}

export function StopButton({ className = "" }: StopButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const stopCommand = async () => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("action", "stop talking")

    try {
      const res = await fetch("http://localhost:8000/command", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        toast.success("Stopped Ami")
      } else {
        toast.error("Failed to send stop command")
      }
    } catch {
      toast.error("Error reaching backend")
    } finally {
      // Always set loading to false after the request completes
      setTimeout(() => setIsLoading(false), 500) // Add a small delay for visual feedback
    }
  }

  return (
    <Button
      onClick={stopCommand}
      disabled={isLoading}
      variant="destructive"
      size="lg"
      className={`bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-xl font-bold rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 ${className}`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          STOPPING...
        </div>
      ) : (
        <>
          <StopCircle className="h-6 w-6 mr-2" />
          STOP
        </>
      )}
    </Button>
  )
}
