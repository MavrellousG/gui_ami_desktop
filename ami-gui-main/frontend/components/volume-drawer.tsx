"use client"

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarProps,
} from "recharts"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

const data = [
  { goal: 0 },
  { goal: 10 },
  { goal: 20 },
  { goal: 30 },
  { goal: 40 },
  { goal: 50 },
  { goal: 60 },
  { goal: 70 },
  { goal: 80 },
  { goal: 90 },
]

interface CustomBarShapeProps {
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  payload?: { goal: number }
  currentGoal: number
}

const CustomBarShape: React.FC<CustomBarShapeProps> = ({
  x,
  y,
  width,
  height,
  payload,
  currentGoal,
}) => {

  const isActive = payload?.goal === currentGoal
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={4}
      ry={4}
      fill={
        isActive
          ? "#4f46e5" // Active bar is blue in light mode
          : "rgba(180, 180, 180, 0.8)" // Non-active bars are lighter gray in light mode for better visibility
      }
      opacity={isActive ? 1 : 0.8}
      className={`${isActive ? "dark:fill-blue-500" : "dark:fill-gray-600"}`}
    />
  )
}

export function VolumeDrawer() {
  const [goal, setGoal] = React.useState(50)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  function onClick(adjustment: number) {
    setGoal(Math.max(0, Math.min(90, goal + adjustment)))
  }

  const sendVolumeCommand = async () => {
    console.log("Button clicked! Function called.")
    setIsSubmitting(true)

    try {
      console.log("Starting volume command with goal:", goal)

      // First command: reduce volume by 90
      const formData1 = new FormData()
      formData1.append("action", "turn the volume down by 90 units")

      console.log("Sending first command: turn the volume down by 90 units")
      const response1 = await fetch("http://localhost:8000/command", {
        method: "POST",
        body: formData1,
      })
      console.log("First command response:", response1.status)

      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 500))

      // Second command: increase volume by the selected amount
      if (goal > 0) {
        const formData2 = new FormData()
        formData2.append("action", `turn the volume up by ${goal} units`)

        console.log(`Sending second command: turn the volume up by ${goal} units`)
        const response2 = await fetch("http://localhost:8000/command", {
          method: "POST",
          body: formData2,
        })
        console.log("Second command response:", response2.status)
      }

      toast.success(`Volume set to ${goal}`)
      setOpen(false) // Close the drawer
    } catch (error) {
      console.error("Error setting volume:", error)
      toast.error("Failed to set volume")
    }

    setIsSubmitting(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="py-3 px-8 min-w-[140px] text-lg font-medium rounded-xl bg-gray-100 dark:bg-black hover:bg-gray-200 dark:hover:bg-[#1a1a1a] dark:text-white dark:border-gray-700 shadow-sm">Volume</Button>
      </DrawerTrigger>
      <DrawerContent className="dark:bg-black dark:border-gray-700">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Set Volume</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full bg-red-500 text-white hover:bg-red-600"
                onClick={() => onClick(-10)}
                disabled={goal <= 1}
              >
                <Minus />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">
                  {goal}
                </div>
                <div className="text-muted-foreground text-[0.70rem] uppercase">
                  Volume Intensity
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full bg-green-500 text-white hover:bg-green-600"
                onClick={() => onClick(10)}
                disabled={goal >= 90}
              >
                <Plus />
                <span className="sr-only">Increase</span>
              </Button>
            </div>

            <div className="mt-3 h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="goal" hide />
                  <YAxis hide />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload && payload.length ? (
                        <div className="rounded bg-white dark:bg-gray-800 px-2 py-1 shadow text-sm dark:text-white border dark:border-gray-700">
                          Volume: {payload[0].value}
                        </div>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="goal"
                    isAnimationActive={false}
                    shape={(props: BarProps) => (
                      <CustomBarShape {...props} currentGoal={goal} />
                    )}
                    fill="#4f46e5"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DrawerFooter>
            <Button
              onClick={sendVolumeCommand}
              disabled={isSubmitting}
              className="dark:bg-black dark:hover:bg-gray-800 dark:text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Setting Volume...
                </div>
              ) : (
                "Set Volume"
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-[#333333]">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
