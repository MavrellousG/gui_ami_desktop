'use client'

import { useState } from "react"
import { 
  Volume2, VolumeOff, MinusIcon, PlusIcon, 
  ScanFaceIcon, LightbulbIcon
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { VolumeDrawer } from "@/components/volume-drawer"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { StopButton } from "@/components/ui/stop-button"

export default function DashboardPage() {
  const [loadingCommands, setLoadingCommands] = useState<{ [command: string]: boolean }>({})

  const sendCommand = async (command: string) => {
    setLoadingCommands(prev => ({ ...prev, [command]: true }))
    const formData = new FormData()
    formData.append("action", command)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const res = await fetch("http://localhost:8000/command", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        toast.success(`Command sent successfully!`)
      } else {
        toast.error("Failed to send command")
      }
    } catch {
      toast.error("Error reaching backend")
    }

    setLoadingCommands(prev => ({ ...prev, [command]: false }))
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
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-lg">Quick controls for Ami&apos;s functions</p>
          </div>

          {/* Emergency Stop Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <StopButton />
          </div>
          
          <div className="max-w-4xl mx-auto w-full px-6 pb-28 py-10">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sound Controls */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-xl mb-5">
                  <Volume2 className="h-7 w-7 text-blue-500" />
                  <h2>Sound Controls</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => sendCommand("enable silent mode")}
                      disabled={loadingCommands["enable silent mode"]}
                      variant="outline"
                      className="flex-1 py-8 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    >
                      {loadingCommands["enable silent mode"] ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <VolumeOff className="h-5 w-5 mr-2" />
                          Silent
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => sendCommand("enable interaction mode")}
                      disabled={loadingCommands["enable interaction mode"]}
                      variant="outline"
                      className="flex-1 py-8 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    >
                      {loadingCommands["enable interaction mode"] ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <Volume2 className="h-5 w-5 mr-2" />
                          Active
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Volume Control Row */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={() => sendCommand("turn the volume down by 10 units")}
                        disabled={loadingCommands["turn the volume down by 10 units"]}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {loadingCommands["turn the volume down by 10 units"] ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <MinusIcon className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div className="flex justify-center">
                        <VolumeDrawer />
                      </div>
                      
                      <Button
                        onClick={() => sendCommand("turn the volume up by 10 units")}
                        disabled={loadingCommands["turn the volume up by 10 units"]}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        {loadingCommands["turn the volume up by 10 units"] ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <PlusIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facial Expressions */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-xl mb-5">
                  <ScanFaceIcon className="h-7 w-7 text-green-500" />
                  <h2>Facial Expressions</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => sendCommand("show happy face")}
                    disabled={loadingCommands["show happy face"]}
                    variant="ghost"
                    className="h-24 border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  >
                    {loadingCommands["show happy face"] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="text-4xl">😊</span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => sendCommand("show sad face")}
                    disabled={loadingCommands["show sad face"]}
                    variant="ghost"
                    className="h-24 border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  >
                    {loadingCommands["show sad face"] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="text-4xl">☹️</span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => sendCommand("show shocked face")}
                    disabled={loadingCommands["show shocked face"]}
                    variant="ghost"
                    className="h-24 border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  >
                    {loadingCommands["show shocked face"] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="text-4xl">😳</span>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => sendCommand("show angry face")}
                    disabled={loadingCommands["show angry face"]}
                    variant="ghost"
                    className="h-24 border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  >
                    {loadingCommands["show angry face"] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <span className="text-4xl">😡</span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Colors */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700 md:col-span-2">
                <div className="flex items-center gap-2 font-bold text-xl mb-5">
                  <LightbulbIcon className="h-7 w-7 text-yellow-500" />
                  <h2>Quick Colors</h2>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {["red", "blue", "green", "yellow", "pink", "orange", "purple", "white"].map((colorName) => (
                    <Button
                      key={colorName}
                      onClick={() => sendCommand(`set light ${colorName}`)}
                      disabled={loadingCommands[`set light ${colorName}`]}
                      variant="ghost"
                      className="h-20 border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all p-2"
                    >
                      {loadingCommands[`set light ${colorName}`] ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: colorName }}
                          />
                          <span className="text-xs first-letter:uppercase">{colorName}</span>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
