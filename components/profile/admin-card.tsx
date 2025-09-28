"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Calendar, Clock, Award, Users, Key, Loader2, AlertCircle } from "lucide-react"
import { getSsProfile, getDistributorStats } from "@/lib/api"
import type { SsProfile, DistributorStats } from "@/lib/api"

export function AdminCard() {
    const [profile, setProfile] = useState<SsProfile | null>(null)
    const [stats, setStats] = useState<DistributorStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const [profileData, statsData] = await Promise.all([
                    getSsProfile(),
                    getDistributorStats()
                ])
                setProfile(profileData)
                setStats(statsData)
            } catch (err) {
                console.error('Error fetching profile data:', err)
                setError('Failed to load profile data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md sticky top-4">
                <CardContent className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-electric-purple" />
                        <span className="text-sm text-muted-foreground">Loading profile...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md sticky top-4">
                <CardContent className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <span className="text-sm text-muted-foreground text-center">{error}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!profile) return null

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        })
    }

    const formatLastLogin = (dateString?: string) => {
        if (!dateString) return 'Never'
        const lastLogin = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60))
        
        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours} hours ago`
        const diffInDays = Math.floor(diffInHours / 24)
        return `${diffInDays} days ago`
    }

    return (        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md sticky top-4">
            <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-electric-purple/30">
                            <AvatarImage src="/placeholder-user.jpg" alt={profile.name} />
                            <AvatarFallback className="bg-gradient-to-r from-electric-purple to-electric-blue text-white text-2xl">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-electric-green to-electric-cyan rounded-full p-2">
                            <Shield className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>
                <CardTitle className="text-xl font-bold">{profile.name}</CardTitle>
                <Badge className="bg-gradient-to-r from-electric-purple to-electric-blue text-white mx-auto">
                    {profile.role === 'ss' ? 'State Supervisor' : profile.role}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Admin Details */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-electric-purple/10 to-electric-blue/10">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-electric-purple" />
                            <span className="text-sm font-medium">Joined</span>
                        </div>
                        <span className="text-sm font-bold text-electric-purple">
                            {formatDate(profile.createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-electric-green/10 to-electric-cyan/10">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-electric-green" />
                            <span className="text-sm font-medium">Last Login</span>
                        </div>
                        <span className="text-sm font-bold text-electric-green">
                            {formatLastLogin(profile.lastLogin)}
                        </span>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-electric-blue/10 to-electric-purple/10">
                            <Users className="h-5 w-5 text-electric-blue mx-auto mb-1" />
                            <div className="text-lg font-bold bg-gradient-to-r from-electric-blue to-electric-purple bg-clip-text text-transparent">
                                {stats?.total || 0}
                            </div>
                            <div className="text-xs text-gray-500">Distributors</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-gradient-to-r from-electric-green/10 to-electric-cyan/10">
                            <Key className="h-5 w-5 text-electric-green mx-auto mb-1" />
                            <div className="text-lg font-bold bg-gradient-to-r from-electric-green to-electric-cyan bg-clip-text text-transparent">
                                {(profile.receivedKeys || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Keys Assigned</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
