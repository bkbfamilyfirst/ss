"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, Search, UserCheck, UserX, KeyRound, AlertCircle, Loader2 } from "lucide-react"
import { useState, useEffect, Key } from "react"
import { toast } from "sonner"
import { SSTable } from "./ss-table"
import { AddSSDialog } from "./add-ss-dialog"
import { EditSSDialog } from "./edit-ss-dialog"
import { DeleteSSDialog } from "./delete-ss-dialog"
import { getDistributorList, getDistributorStats, addDistributor, updateDistributor, deleteDistributor } from "@/lib/api"
import type { Distributor } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export interface StateSupervisor {
  id: Key | null | undefined
  _id: string
  name: string
  email: string
  username: string
  password: string
  phone: string
  address: string
  status: "active" | "inactive"
  receivedKeys: number
  transferredKeys: number
  lastActive?: string
  createdAt: string
  updatedAt?: string
  role: string
  createdBy: string
}

export function ManageSSPage() {
  const [ssData, setSSData] = useState<StateSupervisor[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalKeys: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSS, setEditingSS] = useState<StateSupervisor | null>(null)
  const [deletingSS, setDeletingSS] = useState<StateSupervisor | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [addedDistributor, setAddedDistributor] = useState<null | Omit<StateSupervisor, "_id" | "role" | "createdBy" | "createdAt">>(null)

  // Fetch distributors and stats
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [distributors, distributorStats] = await Promise.all([
        getDistributorList(),
        getDistributorStats()
      ])
      
      // Transform API data to match component interface
      const transformedData: StateSupervisor[] = distributors.map(dist => ({
        id: dist._id, // Add this line to satisfy the StateSupervisor interface
        _id: dist._id,
        name: dist.name,
        email: dist.email,
        username: dist.username || "", // Add username property, fallback to empty string if missing
        password: dist.password || "", // Use password from frontend state if available
        phone: dist.phone,
        address: dist.address,
        status: dist.status as "active" | "inactive",
        receivedKeys: dist.receivedKeys,
        transferredKeys: dist.transferredKeys,
        lastActive: "Recently", // API doesn't provide this, using placeholder
        createdAt: dist.createdAt || new Date().toISOString(),
        updatedAt: dist.updatedAt,
        role: dist.role,
        createdBy: dist.createdBy
      }))
      
      setSSData(transformedData)
      setStats(distributorStats)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load distributor data. Please try again.')
      toast.error('Failed to load distributor data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredSSData = ssData.filter((ss) => {
    const matchesSearch =
      ss.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ss.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ss.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ss.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddSS = async (newSS: Omit<StateSupervisor, "_id" | "role" | "createdBy" | "createdAt">) => {
    try {
      setActionLoading(true)
      const response = await addDistributor({
        name: newSS.name,
        username: newSS.username,
        email: newSS.email,
        phone: newSS.phone,
        address: newSS.address,
        status: newSS.status,
        receivedKeys: newSS.receivedKeys,
        password: newSS.password
      })
      if (response && response.distributor && response.password) {
        setAddedDistributor({
          id: response.distributor._id,
          name: response.distributor.name,
          username: response.distributor.username,
          email: response.distributor.email,
          phone: response.distributor.phone,
          password: response.password,
          address: response.distributor.address || "",
          status: response.distributor.status || "active",
          receivedKeys: response.distributor.receivedKeys || 0,
          transferredKeys: response.distributor.transferredKeys || 0,
          lastActive: "Recently",
          updatedAt: response.distributor.updatedAt,
        });
        setSuccessDialogOpen(true);
      }
      setIsAddDialogOpen(false)
      await fetchData(); // Refresh data
      return response
    } catch (err) {
      console.error('Error adding distributor:', err)
      toast.error('Failed to add distributor. Please try again.')
      return undefined
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSS = async (updatedSS: StateSupervisor) => {
    try {
      setActionLoading(true)
      await updateDistributor(updatedSS._id, {
        name: updatedSS.name,
        email: updatedSS.email,
        phone: updatedSS.phone,
        address: updatedSS.address,
        status: updatedSS.status,
        receivedKeys: updatedSS.receivedKeys
      })
      
      toast.success('Distributor updated successfully')
      setEditingSS(null)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Error updating distributor:', err)
      toast.error('Failed to update distributor. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSS = async (id: string) => {
    try {
      setActionLoading(true)
      await deleteDistributor(id)
      
      toast.success('Distributor deleted successfully')
      setDeletingSS(null)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Error deleting distributor:', err)
      toast.error('Failed to delete distributor. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const distributor = ssData.find(ss => ss._id === id)
      if (!distributor) return
      
      setActionLoading(true)
      const newStatus = distributor.status === "active" ? "inactive" : "active"
      
      await updateDistributor(id, { status: newStatus })
      
      toast.success(`Distributor ${newStatus === "active" ? "activated" : "deactivated"} successfully`)
      await fetchData() // Refresh data
    } catch (err) {
      console.error('Error toggling status:', err)
      toast.error('Failed to update distributor status. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const activeCount = stats.active
  const inactiveCount = stats.inactive

  if (loading) {
    return (
      <div className="responsive-container py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-electric-purple" />
            <p className="text-muted-foreground">Loading distributors...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="responsive-container py-4 sm:py-8">
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground text-center mb-4">{error}</p>
            <Button onClick={fetchData} className="bg-gradient-to-r from-electric-purple to-electric-blue">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="responsive-container py-4 sm:py-8">
      {/* Header */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-electric-blue via-electric-purple to-electric-pink animate-gradient-shift mb-6">
        <CardContent className="p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-3 bg-white/20 backdrop-blur-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Manage Distributor</h2>
                <p className="mt-1 text-white/90 text-1xl">Overview of your Distributor network</p>
              </div>
            </div>
            {/* Add any optional buttons here if needed */}
          </div>

          {/* <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {ssData.length}
              </div>
              <div className="text-sm text-white/80">Total SS</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {activeCount}
              </div>
              <div className="text-sm text-white/80">Active</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {blockedCount}
              </div>
              <div className="text-sm text-white/80">Blocked</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">
                {(ssData.reduce((sum, ss) => sum + ss.keysAllocated, 0) ?? 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/80">Total Keys</div>
            </div>
          </div> */}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md bg-gradient-to-br from-background/30 to-background/10 backdrop-blur-lg">
        <CardContent>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">            {/* Total SS */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-r from-electric-purple/20 to-electric-blue/20 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-electric-purple" />
                <span className="text-sm font-extrabold text-electric-purple">Total Distributor</span>
              </div>
              <span className="text-2xl font-extrabold text-electric-purple">
                {stats.total}
              </span>
            </div>

            {/* Active */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-r from-electric-green/20 to-electric-cyan/20 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="h-5 w-5 text-electric-green" />
                <span className="text-sm font-extrabold text-electric-green">Active</span>
              </div>
              <span className="text-2xl font-extrabold text-electric-green">
                {activeCount}
              </span>
            </div>

            {/* Inactive */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-r from-electric-orange/20 to-electric-pink/20 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-1">
                <UserX className="h-5 w-5 text-electric-orange" />
                <span className="text-sm font-extrabold text-electric-orange">Inactive</span>
              </div>
              <span className="text-2xl font-extrabold text-electric-orange">
                {inactiveCount}
              </span>
            </div>

            {/* Total Keys */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-r from-electric-yellow/20 to-electric-indigo/20 hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="h-5 w-5 text-electric-yellow" />
                <span className="text-sm font-extrabold text-electric-yellow">Total Keys</span>
              </div>
              <span className="text-2xl font-extrabold text-electric-yellow">
                {(stats.totalKeys ?? 0).toLocaleString()}
              </span>
            </div>

          </div>
        </CardContent>
      </Card>


      {/* Controls */}
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300 mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left section: Search + Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-1 w-full">
              {/* Search input */}
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* Filter buttons */}              <div className="flex flex-wrap gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-gradient-to-r from-electric-purple to-electric-blue" : ""}
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                  className={statusFilter === "active" ? "bg-gradient-to-r from-electric-green to-electric-cyan" : ""}
                >
                  Active ({activeCount})
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                  className={statusFilter === "inactive" ? "bg-gradient-to-r from-electric-orange to-electric-pink" : ""}
                >
                  Inactive ({inactiveCount})
                </Button>
              </div>
            </div>

            {/* Add New SS Button */}
            <div className="w-full sm:w-auto">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-electric-purple to-electric-blue hover:from-electric-purple/80 hover:to-electric-blue/80"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Distributor
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* SS Table */}
      <SSTable
        data={filteredSSData}
        onEdit={setEditingSS}
        onDelete={setDeletingSS}
        onToggleStatus={handleToggleStatus}
      />

      {/* Dialogs */}
      <AddSSDialog open={isAddDialogOpen} onOpenChangeAction={setIsAddDialogOpen} onAddAction={handleAddSS} />

      {editingSS && (
        <EditSSDialog
          open={!!editingSS}
          onOpenChange={(open) => !open && setEditingSS(null)}
          ss={editingSS}
          onEdit={handleEditSS}
        />
      )}

      {deletingSS && (
        <DeleteSSDialog
          open={!!deletingSS}
          onOpenChange={(open) => !open && setDeletingSS(null)}
          ss={deletingSS}
          onDelete={handleDeleteSS}
        />
      )}

      {/* Render Success Dialog in parent */}
      {successDialogOpen && addedDistributor && (
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="sm:max-w-[400px] px-6 py-6">
            <DialogHeader>
              <DialogTitle className="text-green-600">Distributor Added Successfully</DialogTitle>
            </DialogHeader>
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
                  navigator.clipboard.writeText(text);
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
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
