"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import type { StateSupervisor } from "./manage-ss-page"
import { toast } from "sonner"

interface AddSSDialogProps {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  onAddAction: (ss: Omit<StateSupervisor, "_id" | "role" | "createdBy" | "createdAt">) => Promise<any>
}

export function AddSSDialog({ open, onOpenChangeAction, onAddAction }: AddSSDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    location: "",
    status: "active" as "active" | "inactive",
    assignedKeys: 0,
    usedKeys: 0,
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [addedDistributor, setAddedDistributor] = useState<null | {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required"
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required"
    }
    if (formData.assignedKeys < 0) {
      newErrors.assignedKeys = "Keys allocated must be 0 or greater"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    setLoading(true)
    // Close add dialog immediately
    onOpenChangeAction(false)
    try {
      // Call the API and get the response
      const response = await onAddAction({
        id: crypto.randomUUID(),
        ...formData,
        lastActive: "Just now",
        updatedAt: new Date().toISOString(),
      })
      // If response contains distributor and password, show success dialog
      if (response && response.distributor && response.password) {
        setAddedDistributor({
          name: response.distributor.name,
          username: response.distributor.username,
          email: response.distributor.email,
          phone: response.distributor.phone,
          password: response.password,
        })
        setSuccessDialogOpen(true)
      } else {
        toast.error("Failed to add distributor. Please try again.")
      }
      // Reset form
      setFormData({
        name: "",
        username: "",
        email: "",
        phone: "",
        location: "",
        status: "active",
        assignedKeys: 0,
        usedKeys: 0,
        password: "",
      })
      setErrors({})
    } catch (error) {
      toast.error("Failed to add distributor. Please try again.")
      console.error('Error adding distributor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChangeAction}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="rounded-full p-2 bg-gradient-to-r from-electric-purple to-electric-blue">
                <span className="text-white text-sm">+</span>
              </div>
              Add New Distributor
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter username"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
              
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter location or region"
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>              <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label htmlFor="assignedKeys">Initial Keys Allocation</Label>
                <Input
                  id="assignedKeys"
                  type="number"
                  min="0"
                  value={formData.assignedKeys}
                  onChange={(e) => handleInputChange("assignedKeys", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.assignedKeys ? "border-red-500" : ""}
                />
                {errors.assignedKeys && <p className="text-sm text-red-500">{errors.assignedKeys}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter password"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChangeAction(false)} className="flex-1" disabled={loading}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-electric-purple to-electric-blue hover:from-electric-purple/80 hover:to-electric-blue/80"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Distributor"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">Distributor Added Successfully</DialogTitle>
          </DialogHeader>
          {addedDistributor && (
            <div className="space-y-2">
              <div><strong>Name:</strong> {addedDistributor.name}</div>
              <div><strong>Username:</strong> {addedDistributor.username}</div>
              <div><strong>Email:</strong> {addedDistributor.email}</div>
              <div><strong>Phone:</strong> {addedDistributor.phone}</div>
              <div><strong>Password:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{addedDistributor.password}</span></div>
              <Button
                type="button"
                className="mt-4 w-full bg-gradient-to-r from-electric-purple to-electric-blue text-white"
                onClick={() => {
                  const text = `Name: ${addedDistributor.name}\nUsername: ${addedDistributor.username}\nEmail: ${addedDistributor.email}\nPhone: ${addedDistributor.phone}\nPassword: ${addedDistributor.password}`;
                  navigator.clipboard.writeText(text)
                }}
              >
                Copy All to Clipboard
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setSuccessDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
