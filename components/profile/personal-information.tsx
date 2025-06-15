"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, MapPin, Save, Edit, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getSsProfile, updateSsProfile } from "@/lib/api"
import type { SsProfile } from "@/lib/api"

export function PersonalInformation() {
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [profile, setProfile] = useState<SsProfile | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "",
    })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                setError(null)
                const profileData = await getSsProfile()
                setProfile(profileData)
                setFormData({
                    name: profileData.name || "",
                    email: profileData.email || "",
                    phone: profileData.phone || "",
                    location: profileData.location || "",
                })
            } catch (err) {
                console.error('Error fetching profile:', err)
                setError('Failed to load profile data')
                toast.error('Failed to load profile data')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await updateSsProfile(formData)
            
            // Update local profile state
            if (profile) {
                setProfile({ ...profile, ...formData })
            }
            
            setIsEditing(false)
            toast.success('Profile updated successfully')
        } catch (err) {
            console.error('Error updating profile:', err)
            toast.error('Failed to update profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        // Reset form data to original profile data
        if (profile) {
            setFormData({
                name: profile.name || "",
                email: profile.email || "",
                phone: profile.phone || "",
                location: profile.location || "",
            })
        }
        setIsEditing(false)
    }

    if (loading) {
        return (
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md">
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
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md">
                <CardContent className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <span className="text-sm text-muted-foreground text-center">{error}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="rounded-full p-2 bg-gradient-to-r from-electric-purple to-electric-blue">
                        <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-electric-purple to-electric-blue bg-clip-text text-transparent">
                        Personal Information
                    </span>
                </CardTitle>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                disabled={saving}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-gradient-to-r from-electric-purple to-electric-blue hover:from-electric-purple/80 hover:to-electric-blue/80"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="border-electric-purple/30 text-electric-purple hover:bg-electric-purple/10"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={!isEditing}
                        className="border-electric-purple/30 focus:border-electric-purple focus:ring-electric-purple/20"
                    />
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="h-4 w-4 text-electric-blue" />
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={!isEditing}
                            className="border-electric-blue/30 focus:border-electric-blue focus:ring-electric-blue/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4 text-electric-green" />
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            disabled={!isEditing}
                            className="border-electric-green/30 focus:border-electric-green focus:ring-electric-green/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-electric-orange" />
                            Location
                        </Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleInputChange("location", e.target.value)}
                            disabled={!isEditing}
                            className="border-electric-orange/30 focus:border-electric-orange focus:ring-electric-orange/20"
                        />
                    </div>
                </div>

                {/* Profile Stats */}
                {profile && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Account Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-gradient-to-r from-electric-purple/10 to-electric-blue/10">
                                <div className="text-xs text-gray-500 mb-1">Role</div>
                                <div className="text-sm font-medium capitalize">{profile.role}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-r from-electric-green/10 to-electric-cyan/10">
                                <div className="text-xs text-gray-500 mb-1">Status</div>
                                <div className="text-sm font-medium capitalize">{profile.status}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-r from-electric-orange/10 to-electric-pink/10">
                                <div className="text-xs text-gray-500 mb-1">Assigned Keys</div>
                                <div className="text-sm font-medium">{(profile.assignedKeys || 0).toLocaleString()}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-gradient-to-r from-electric-blue/10 to-electric-purple/10">
                                <div className="text-xs text-gray-500 mb-1">Used Keys</div>
                                <div className="text-sm font-medium">{(profile.usedKeys || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}