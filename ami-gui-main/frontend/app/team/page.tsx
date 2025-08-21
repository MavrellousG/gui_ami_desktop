"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import team_data from "../data/team_data.json"

type TeamMember = {
    name: string
    roles: string[]
    email: string
    image: string
    profileUrl: string
}

const team: TeamMember[] = team_data

const roleClassMap: Record<string, string> = {
    "Software Engineer": "border-green-500 text-green-500",
    "Intern": "border-emerald-500 text-emerald-500",
    "Associate": "border-blue-500 text-blue-500",
    "Senior Associate": "border-blue-500 text-blue-500",
    "Lead Consultant": "border-purple-500 text-purple-500",
    "Senior Principal": "border-red-500 text-red-500"
}

export default function Page() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRole, setSelectedRole] = useState("")

    const roles = [...new Set(team.flatMap((m) => m.roles))]

    const filteredTeam = team.filter((member) => {
        const nameMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
        const roleMatch = selectedRole === "" || member.roles.includes(selectedRole)
        return nameMatch && roleMatch
    })

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
                <div className="flex flex-1 flex-col min-h-screen">
                    <div className="px-6 pt-6">
                        <h1 className="text-3xl font-bold tracking-tight">Our Team</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Here&apos;s the Infosys Living Labs Team</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 px-6 pt-4">
                        <div className="flex flex-col w-full sm:w-64">
                            <Label htmlFor="search">Search by name</Label>
                            <Input
                                id="search"
                                type="text"
                                placeholder="e.g. Alice"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-2"
                            />
                        </div>
                        <div className="flex flex-col w-full sm:w-64">
                            <Label htmlFor="role">Filter by role</Label>
                            <select
                                id="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="mt-2 rounded-md border px-3 py-2 text-sm bg-background"
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 py-6 px-6">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredTeam.map((member) => (
                                <Card
                                    key={member.email}
                                    className="flex flex-col items-center text-center p-6 rounded-2xl border bg-background shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <CardHeader className="flex justify-center p-0">
                                        <Link href={member.profileUrl}>
                                            <Avatar className="h-20 w-20 hover:scale-105 transition-transform duration-200">
                                                <AvatarImage src={member.image} alt={member.name} />
                                                <AvatarFallback>
                                                    {member.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </CardHeader>

                                    <CardContent className="flex flex-col items-center gap-1">
                                        <h3 className="text-lg font-semibold">{member.name}</h3>
                                        <p className="text-sm text-muted-foreground">{member.email}</p>
                                    </CardContent>

                                    <CardFooter className="flex flex-wrap justify-center gap-1">
                                        {member.roles.map((role) => (
                                            <Badge
                                                key={role}
                                                variant="outline"
                                                className={roleClassMap[role] || "border-muted text-muted-foreground"}
                                            >
                                                {role}
                                            </Badge>
                                        ))}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}