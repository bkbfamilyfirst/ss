"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Key,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { changeDistributorPassword } from "@/lib/api"
import { toast } from "sonner"
import type { StateSupervisor } from "./manage-ss-page"

interface SSTableProps {
  data: StateSupervisor[]
  onEdit: (ss: StateSupervisor) => void
  onDelete: (ss: StateSupervisor) => void
  onToggleStatus: (id: string) => void
  perPage?: number
}

export function SSTable({ data, onEdit, onDelete, onToggleStatus, perPage = 5 }: SSTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [confirmChangeOpen, setConfirmChangeOpen] = useState(false)
  const [selectedSS, setSelectedSS] = useState<StateSupervisor | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [changing, setChanging] = useState(false)
  const [changeSuccess, setChangeSuccess] = useState<null | { password: string }>(null)

  const totalPages = Math.ceil(data.length / perPage)

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return data.slice(start, start + perPage)
  }, [data, currentPage, perPage])

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

  if (data.length === 0) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-muted-foreground text-center">
            <div className="text-lg font-medium mb-2">No State Supervisors Found</div>
            <div className="text-sm">Try adjusting your search or filter criteria</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card Layout */}
      <div className="block lg:hidden space-y-4">
        {paginatedData.map((ss) => (
          <Card
            key={ss.id}
            className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder.svg?height=48&width=48&query=${ss.name}`} alt={ss.name} />
                    <AvatarFallback>
                      {ss.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>                  <div>
                    <div className="font-semibold text-lg">{ss.name}</div>
                    <Badge
                      variant={ss.status === "active" ? "default" : "destructive"}
                      className={
                        ss.status === "active"
                          ? "bg-gradient-to-r from-electric-green to-electric-cyan border-0"
                          : "bg-gradient-to-r from-electric-orange to-electric-pink border-0"
                      }
                    >
                      {ss.status.charAt(0).toUpperCase() + ss.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={ss.status === "active"} onCheckedChange={() => onToggleStatus(ss._id)} />
                </div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-electric-blue" />
                  <span>{ss.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-electric-green" />
                  <span>{ss.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-electric-orange" />
                  <span>{ss.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-electric-purple" />
                  <span>
                    {ss.transferredKeys.toLocaleString()} / {ss.receivedKeys.toLocaleString()} keys
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-electric-cyan" />
                  <span>Last active: {ss.lastActive || "Recently"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => onEdit(ss)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(ss)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <Card className="hidden lg:block border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-4 text-left font-medium">Distributor</th>
                  <th className="px-6 py-4 text-left font-medium">Contact</th>
                  <th className="px-6 py-4 text-left font-medium">address</th>
                  <th className="px-6 py-4 text-left font-medium">Keys Usage</th>
                  <th className="px-6 py-4 text-left font-medium">Status</th>
                  <th className="px-6 py-4 text-left font-medium">Last Active</th>
                  <th className="px-6 py-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>                
                {paginatedData.map((ss) => (
                  <tr key={ss._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={`/placeholder.svg?height=40&width=40&query=${ss.name}`} alt={ss.name} />
                          <AvatarFallback>
                            {ss.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{ss.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined {new Date(ss.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-electric-blue" />
                          <span>{ss.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-electric-green" />
                          <span>{ss.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-electric-orange" />
                        <span>{ss.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {ss.transferredKeys.toLocaleString()} / {ss.receivedKeys.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-electric-blue to-electric-purple h-2 rounded-full"
                            style={{ width: `${ss.receivedKeys > 0 ? (ss.transferredKeys / ss.receivedKeys) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={ss.status === "active"} onCheckedChange={() => onToggleStatus(ss._id)} />
                        <Badge
                          variant={ss.status === "active" ? "default" : "destructive"}
                          className={
                            ss.status === "active"
                              ? "bg-gradient-to-r from-electric-green to-electric-cyan border-0"
                              : "bg-gradient-to-r from-electric-orange to-electric-pink border-0"
                          }
                        >
                          {ss.status.charAt(0).toUpperCase() + ss.status.slice(1)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-electric-cyan" />
                        <span>{ss.lastActive || "Recently"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEdit(ss)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(ss)}>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSS(ss)
                                setNewPassword("")
                                setShowNewPassword(false)
                                setConfirmChangeOpen(true)
                              }}
                            >
                              <Key className="h-4 w-4 mr-2" /> Change Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 pt-4">
        <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      {/* Change Password Dialog */}
      {/* Confirm Change Password Dialog (shows before the full form) */}
      <Dialog open={confirmChangeOpen} onOpenChange={setConfirmChangeOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Confirm Password Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">Are you sure you want to change the password for <strong>{selectedSS?.name}</strong>?</div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setConfirmChangeOpen(false)
                  // small timeout to ensure the confirm dialog closes before opening the form
                  setTimeout(() => setChangePasswordOpen(true), 120)
                }}
              >
                Yes, continue
              </Button>
              <Button variant="outline" onClick={() => setConfirmChangeOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Change Distributor Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">New Password</label>
              </div>
              <div className="relative mt-2">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowNewPassword((s) => !s)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={async () => {
                  if (!selectedSS) return
                  try {
                    setChanging(true)
                    const payloadPassword = newPassword && newPassword.trim() !== '' ? newPassword : undefined
                    const response = await changeDistributorPassword(selectedSS._id, payloadPassword || '')
                    // backend returns the new password in response or we used provided one
                    const pwd = response?.newPassword || payloadPassword || newPassword
                    setChangeSuccess({ password: pwd })
                    setChangePasswordOpen(false)
                  } catch (err: any) {
                    console.error('Change password error:', err)
                    toast.error(err?.response?.data?.message || 'Failed to change password. Please try again.')
                  } finally {
                    setChanging(false)
                  }
                }}
                disabled={changing}
              >
                {changing ? 'Saving...' : 'Change Password'}
              </Button>
              <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Success Dialog */}
      <Dialog open={!!changeSuccess} onOpenChange={() => setChangeSuccess(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Password Changed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm">New Password:</div>
            <div className="flex items-center gap-2">
              <code className="font-mono bg-gray-100 px-2 py-1 rounded">{changeSuccess?.password}</code>
              <button
                type="button"
                onClick={() => {
                  if (changeSuccess?.password) {
                    navigator.clipboard.writeText(changeSuccess.password)
                    toast.success('Password copied to clipboard')
                  }
                }}
                className="ml-2"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={() => setChangeSuccess(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
