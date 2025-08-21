'use client'

import { useState, useRef } from "react"
import { 
  MessageCircleQuestion, Globe, FileText, X, Send, Loader2
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StopButton } from "@/components/ui/stop-button"

export default function AskWithContextPage() {
  const [question, setQuestion] = useState("")
  const [contexts, setContexts] = useState<{
    type: 'url' | 'document';
    value: string;
    content?: string;
    isLoading?: boolean;
    error?: string;
  }[]>([])
  const [currentContext, setCurrentContext] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [commandDebug, setCommandDebug] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendCommand = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    
    try {
      // Collect URLs from contexts for RAG processing
      const urlContexts = contexts.filter(ctx => ctx.type === 'url').map(ctx => ctx.value)
      
      const formData = new FormData()
      formData.append("question", question)
      
      // Send URLs to be processed by RAG system
      if (urlContexts.length > 0) {
        formData.append("urls", urlContexts.join(','))
      }

      console.log("Sending question to RAG system:", question);
      console.log("URLs for RAG context:", urlContexts);

      const res = await fetch("http://localhost:8000/ask-with-context", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        
        // Save the enhanced command for debug display
        setCommandDebug(data.enhanced_command);
        
        console.log("Enhanced command from RAG:", data.enhanced_command);

        toast.success(`Question processed with RAG!`, {
          description: data.rag_context_found 
            ? `Enhanced with context from ${urlContexts.length} URL(s)` 
            : "No additional RAG context found"
        })
        
        toast.info(`RAG-enhanced command ready`, {
          duration: 5000,
          description: "See debug panel for full enhanced command",
          action: {
            label: "Debug",
            onClick: () => setShowDebug(true)
          }
        })
        
        setQuestion("")
      } else {
        toast.error("Failed to process question with RAG")
      }
    } catch (error) {
      console.error("Error processing with RAG:", error)
      toast.error("Error reaching RAG system")
    }

    setIsLoading(false)
  }

  const addContext = async (type: 'url' | 'document') => {
    if (!currentContext.trim()) return
    
    const value = currentContext.trim()
    
    // For URLs, ensure we have proper http/https prefix
    let processedValue = value
    if (type === 'url' && !value.startsWith('http://') && !value.startsWith('https://')) {
      processedValue = 'https://' + value
    }
    
    // Add the context immediately with loading state if it's a URL
    const newContext = { type, value: processedValue, isLoading: type === 'url' }
    setContexts([...contexts, newContext])
    setCurrentContext("")
    
    // If it's a URL, scrape it
    if (type === 'url') {
      try {
        // Create form data for the request
        const formData = new FormData()
        formData.append("url", processedValue)
        
        const response = await fetch("http://localhost:8000/scrape-url", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(`Failed to scrape URL: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          // Update the context with the scraped content
          setContexts(prev => prev.map(ctx => 
            ctx.value === processedValue && ctx.type === 'url'
              ? { ...ctx, content: data.content, isLoading: false }
              : ctx
          ))
          toast.success("URL content scraped successfully")
          
          // Log the scraped content to the console for debugging
          console.log(`Scraped content for ${processedValue}:`, data.content)
        } else {
          // Just add the URL without scraping content rather than showing an error
          setContexts(prev => prev.map(ctx => 
            ctx.value === processedValue && ctx.type === 'url'
              ? { ...ctx, isLoading: false }
              : ctx
          ))
          console.error(`Failed to scrape URL: ${data.error || "Unknown error"}`)
          toast.info("Using URL without scraping content")
        }
      } catch (error) {
        // Just add the URL without scraping content rather than showing an error
        setContexts(prev => prev.map(ctx => 
          ctx.value === processedValue && ctx.type === 'url'
            ? { ...ctx, isLoading: false }
            : ctx
        ))
        console.error("Error scraping URL:", error)
        toast.info("Using URL without scraping content")
      }
    }
  }

  const removeContext = (index: number) => {
    const newContexts = [...contexts]
    newContexts.splice(index, 1)
    setContexts(newContexts)
    
    // If this was the last context, clear the collection
    if (newContexts.length === 0) {
      clearCollection()
    }
  }

  const clearCollection = async () => {
    try {
      const response = await fetch("http://localhost:8000/clear-collection", {
        method: "POST",
        headers: {
          "Authorization": "Bearer SECRET123"
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        toast.success("Collection cleared", {
          description: "All stored content has been removed from the database"
        })
        console.log("Collection cleared:", data.collection_name)
      } else {
        toast.error("Failed to clear collection")
      }
    } catch (error) {
      console.error("Error clearing collection:", error)
      toast.error("Error clearing collection")
    }
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
            <h1 className="text-4xl font-bold tracking-tight">Ask With Context</h1>
            <p className="text-muted-foreground mt-1 text-lg">Ask Ami questions with URLs and documents as context</p>
          </div>

          {/* Emergency Stop Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <StopButton />
          </div>
          
          <div className="max-w-4xl mx-auto w-full px-6 pb-28 py-10">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
              <div className="flex items-center gap-2 font-bold text-xl mb-5">
                <MessageCircleQuestion className="h-7 w-7 text-blue-500" />
                <h2>Ask With Context</h2>
              </div>
              
              {/* Context Input Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Add URLs or Documents for Context</label>
                
                <div className="flex gap-2 mb-4">
                  <Input 
                    value={currentContext}
                    onChange={(e) => setCurrentContext(e.target.value)}
                    placeholder="Enter URL or document name..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => addContext('url')}
                    variant="outline"
                    className="gap-1 whitespace-nowrap dark:bg-black dark:border-gray-700"
                  >
                    <Globe className="h-4 w-4" />
                    Add URL
                  </Button>
                  <Button 
                    onClick={() => addContext('document')}
                    variant="outline"
                    className="gap-1 whitespace-nowrap dark:bg-black dark:border-gray-700"
                  >
                    <FileText className="h-4 w-4" />
                    Add Doc
                  </Button>
                </div>
                
                {/* Context Pills */}
                {contexts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {contexts.map((ctx, index) => (
                      <div 
                        key={index}
                        className={`flex items-center px-3 py-1 rounded-full text-sm ${
                          ctx.type === 'url'
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        }`}
                      >
                        {ctx.type === 'url' ? (
                          <>
                            <Globe className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                            {ctx.isLoading && (
                              <Loader2 className="h-3 w-3 mr-1.5 animate-spin text-blue-500" />
                            )}
                          </>
                        ) : (
                          <FileText className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                        )}
                        <span 
                          className={`truncate max-w-[200px] ${ctx.type === 'url' ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}
                          title={ctx.value}
                        >
                          {ctx.value}
                        </span>
                        <button 
                          onClick={() => removeContext(index)}
                          className="ml-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {contexts.length > 0 && (
                      <button
                        onClick={() => {
                          setContexts([])
                          clearCollection()
                        }}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                )}
                
                {/* Content Previews for URLs that have been scraped */}
                {contexts.some(ctx => ctx.content) && (
                  <div className="mt-4 space-y-3">
                    <h3 className="text-sm font-medium">Scraped Content Previews:</h3>
                    {contexts.filter(ctx => ctx.content).map((ctx, index) => (
                      <div key={`content-${index}`} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Globe className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-sm font-medium truncate">{ctx.value}</span>
                        </div>
                        <div className="text-xs text-gray-700 dark:text-gray-300 max-h-24 overflow-y-auto">
                          {ctx.content?.substring(0, 300)}
                          {(ctx.content?.length || 0) > 300 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Question Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Question</label>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything with your added context..."
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
                <div className="flex justify-between items-center mt-1.5">
                  <button
                    onClick={() => setShowDebug(prev => !prev)}
                    className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      DEV
                    </span>
                    {contexts.some(ctx => ctx.type === 'url' && ctx.content) && !showDebug && (
                      <span className="ml-1 px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {contexts.filter(ctx => ctx.type === 'url' && ctx.content).length} URL(s) scraped
                      </span>
                    )}
                  </button>
                  <p className="text-xs text-gray-500">Press Ctrl+Enter to send</p>
                </div>

                {/* Debug Panel */}
                {showDebug && (
                  <div className="mt-4 border border-blue-200 dark:border-blue-800 rounded-md p-3 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex justify-between">
                      <span>Command Debug Information:</span>
                      {commandDebug && (
                        <button
                          onClick={() => navigator.clipboard.writeText(commandDebug)}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          Copy to Clipboard
                        </button>
                      )}
                    </h4>
                    
                    {/* Command Preview */}
                    {commandDebug ? (
                      <div className="mb-4">
                        <h5 className="text-xs font-medium mb-1">RAG-Enhanced Command:</h5>
                        <pre className="text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-black p-2 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto max-h-40">
                          {commandDebug}
                        </pre>
                        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                          ✅ This command includes context retrieved from your URLs using LangChain RAG
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600 dark:text-gray-400 italic p-2 mb-4">
                        No RAG-enhanced commands have been generated yet. Add URLs and ask a question to see the enhanced result.
                      </div>
                    )}
                    
                    {/* Scraped Content Section */}
                    {contexts.some(ctx => ctx.type === 'url') && (
                      <div className="mt-4 border-t border-blue-200 dark:border-blue-700 pt-3">
                        <h5 className="text-xs font-medium mb-2 text-blue-700 dark:text-blue-300">Full Scraped Content:</h5>
                        <div className="space-y-3">
                          {contexts.filter(ctx => ctx.type === 'url').map((ctx, index) => (
                            <div key={`debug-content-${index}`} className="border border-gray-200 dark:border-gray-700 rounded">
                              <div className="bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center">
                                  <Globe className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  <span className="text-xs font-medium truncate max-w-[280px]">{ctx.value}</span>
                                </div>
                                {ctx.content && (
                                  <button
                                    onClick={() => navigator.clipboard.writeText(ctx.content || '')}
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                  >
                                    Copy
                                  </button>
                                )}
                              </div>
                              {ctx.isLoading ? (
                                <div className="p-3 text-center">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1" />
                                  <span className="text-xs text-gray-500">Loading content...</span>
                                </div>
                              ) : ctx.content ? (
                                <pre className="text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-black p-2 overflow-x-auto max-h-60">
                                  {ctx.content}
                                </pre>
                              ) : (
                                <div className="p-3 text-center text-xs text-gray-500 italic">
                                  No content was scraped from this URL.
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                      <p>This panel shows the exact command sent to the backend and the full scraped content from URLs.</p>
                      <p className="mt-1">Commands and scraped content are also logged to your browser console (F12).</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
