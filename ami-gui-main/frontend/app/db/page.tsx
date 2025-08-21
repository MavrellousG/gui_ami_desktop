'use client'

import { useState } from "react"
import { 
  Volume2, VolumeOff, MinusIcon, PlusIcon, 
  AudioLines, EqualApproximately, CatIcon, DogIcon,
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
        toast.success(`Sent: "${command}"`)
      } else {
        toast.error("Failed to send command")
      }
    } catch {
      toast.error("Error reaching backend")
    }

    setLoadingCommands(prev => ({ ...prev, [command]: false }))
  }

  // Helper function to generate command buttons with consistent styling
  const CommandButton = ({ 
    command, 
    label, 
    icon, 
    size = "default",
    variant = "default",
    className = "" 
  }: { 
    command: string, 
    label: React.ReactNode, 
    icon?: React.ReactNode,
    size?: "default" | "icon" | "lg",
    variant?: "default" | "destructive" | "secondary" | "ghost" | "outline",
    className?: string 
  }) => {
    const isLoading = loadingCommands[command];
    let sizeClass = "";
    
    if (size === "icon") {
      sizeClass = "p-3 rounded-xl";
    } else if (size === "lg") {
      sizeClass = "p-5 text-lg rounded-xl";
    }
    
    return (
      <Button
        onClick={() => sendCommand(command)}
        disabled={isLoading}
        variant={variant}
        className={`${className} ${sizeClass} shadow-sm hover:shadow-md transition-all`}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <>
            {icon && <span className={label ? "mr-2" : ""}>{icon}</span>}
            {label}
          </>
        )}
      </Button>
    );
  };

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
            <h1 className="text-4xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground mt-1 text-lg">Control Ami&apos;s key functions</p>
          </div>

          {/* Emergency Stop Button - Fixed Position */}
          <div className="fixed bottom-8 right-8 z-50">
            <StopButton />
          </div>
          
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Sound Controls */}
              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-xl mb-7">
                  <Volume2 className="h-7 w-7 text-blue-500" />
                  <h2>Sound</h2>
                </div>
                
                <div className="space-y-7">
                  <div className="flex flex-wrap gap-5 justify-center">
                    <CommandButton
                      command="enable silent mode"
                      label="Silent Mode"
                      icon={<VolumeOff className="h-6 w-6" />}
                      variant="outline"
                      className="flex-1 py-5 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    />
                    <CommandButton
                      command="enable interaction mode"
                      label="Talking Mode"
                      icon={<Volume2 className="h-6 w-6" />}
                      variant="outline"
                      className="flex-1 py-5 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between gap-5">
                    <CommandButton
                      command="turn the volume down by 10 units"
                      label=""
                      icon={<MinusIcon className="h-5 w-5" />}
                      size="icon"
                      variant="outline"
                      className="h-12 w-12 text-xl bg-red-500 hover:bg-red-600 dark:bg-red-600/80 dark:hover:bg-red-600/90 text-white flex items-center justify-center p-0 border-red-500 dark:border-red-600/50"
                    />
                    <VolumeDrawer />
                    <CommandButton
                      command="turn the volume up by 10 units"
                      label=""
                      icon={<PlusIcon className="h-5 w-5" />}
                      size="icon"
                      variant="outline" 
                      className="h-12 w-12 text-xl bg-green-500 hover:bg-green-600 dark:bg-green-600/80 dark:hover:bg-green-600/90 text-white flex items-center justify-center p-0 border-green-500 dark:border-green-600/50"
                    />
                  </div>
                </div>
              </div>

              {/* Custom SFX */}
              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-xl mb-7">
                  <AudioLines className="h-7 w-7 text-purple-500" />
                  <h2>Custom SFX</h2>
                </div>
                
                <div className="space-y-7">
                  <div className="flex justify-center">
                    <CommandButton
                      command="play a whistle sound"
                      label="Whistle"
                      icon={<EqualApproximately className="h-6 w-6" />}
                      variant="outline"
                      className="w-full py-5 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    />
                  </div>
                  
                  <div className="flex gap-5">
                    <CommandButton
                      command="play a meow sound"
                      label="Meow"
                      icon={<CatIcon className="h-6 w-6" />}
                      variant="outline"
                      className="flex-1 py-5 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    />
                    <CommandButton
                      command="play a woof sound"
                      label="Woof"
                      icon={<DogIcon className="h-6 w-6" />}
                      variant="outline"
                      className="flex-1 py-5 text-lg dark:bg-black dark:hover:bg-[#1a1a1a] dark:border-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Faces */}
              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-xl mb-7">
                  <ScanFaceIcon className="h-7 w-7 text-green-500" />
                  <h2>Faces</h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
                  <CommandButton
                    command="show happy face"
                    label={<span className="text-5xl">😊</span>}
                    size="icon"
                    variant="ghost"
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show sad face"
                    label={<span className="text-5xl">☹️</span>}
                    size="icon"
                    variant="ghost"
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show shocked face"
                    label={<span className="text-5xl">😳</span>}
                    size="icon"
                    variant="ghost"
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show angry face"
                    label={<span className="text-5xl">😡</span>}
                    size="icon"
                    variant="ghost" 
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show confused face"
                    label={<span className="text-5xl">🤔</span>}
                    size="icon"
                    variant="ghost"
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show sleepy face"
                    label={<span className="text-5xl">😴</span>}
                    size="icon"
                    variant="ghost"
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show silly face"
                    label={<span className="text-5xl">🤪</span>}
                    size="icon"
                    variant="ghost"
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                  <CommandButton
                    command="show cool face"
                    label={<span className="text-5xl">😎</span>}
                    size="icon"
                    variant="ghost" 
                    className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all"
                  />
                </div>
              </div>

              {/* Quick Colors */}
              <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-200 dark:bg-black dark:border-gray-700">
                <div className="flex items-center gap-2 font-bold text-xl mb-7">
                  <LightbulbIcon className="h-7 w-7 text-yellow-500" />
                  <h2>Quick Colors</h2>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {["red", "blue", "green", "yellow", "pink", "orange", "purple", "white"].map((colorName) => (
                    <CommandButton
                      key={colorName}
                      command={`set light ${colorName}`}
                      label={
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: colorName }}
                          />
                          <span className="text-xs first-letter:uppercase">{colorName}</span>
                        </div>
                      }
                      variant="ghost"
                      className="h-24 w-full border border-gray-200 dark:border-gray-700 dark:bg-black dark:hover:bg-[#1a1a1a] hover:shadow-md transition-all p-2"
                    />
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
