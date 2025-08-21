'use client'

import { useState, useRef } from "react"
import { 
  MessageCircleQuestion, Send
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { StopButton } from "@/components/ui/stop-button"

export default function AskAmiPage() {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendCommand = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("action", question)

      const res = await fetch("http://localhost:8000/command", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        toast.success(`Command sent successfully!`)
        setQuestion("")
      } else {
        toast.error("Failed to send command")
      }
    } catch (error) {
      console.error("Error sending command:", error)
      toast.error("Error reaching backend")
    }

    setIsLoading(false)
  }

  // Handle keyboard shortcut (Ctrl+Enter or Cmd+Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      sendCommand()
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        
        <div className="flex flex-1 flex-col min-h-screen dark:bg-black py-10">
          <div className="px-6 pt-6 pb-6 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Ask Ami</h1>
            <p className="text-muted-foreground mt-1 text-lg">Ask Ami any question or give her a command</p>
          </div>

          {/* Emergency Stop Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <StopButton />
          </div>
          
          <div className="max-w-4xl mx-auto w-full px-6 pb-28 py-10">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
              <div className="flex items-center gap-2 font-bold text-xl mb-5">
                <MessageCircleQuestion className="h-7 w-7 text-blue-500" />
                <h2>Ask Ami Anything</h2>
              </div>
              
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Question or Command</label>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Ami anything or give her a command..."
                    className="min-h-[120px] pr-12 dark:bg-black dark:border-gray-700"
                  />
                  <Button
                    onClick={sendCommand}
                    disabled={isLoading || !question.trim()}
                    className="absolute bottom-3 right-3 size-8 p-0 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-end items-center mt-1.5">
                  <p className="text-xs text-gray-500">Press Ctrl+Enter to send</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
