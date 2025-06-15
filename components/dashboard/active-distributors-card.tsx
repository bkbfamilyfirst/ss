"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, UserCheck, UserX, Loader2, AlertCircle } from "lucide-react"
import { getDistributorList, getDistributorStats } from "@/lib/api"
import type { Distributor, DistributorStats } from "@/lib/api"

export function ActiveDistributorsCard() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [stats, setStats] = useState<DistributorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [distributorsData, statsData] = await Promise.all([
          getDistributorList(),
          getDistributorStats()
        ])
        setDistributors(distributorsData.slice(0, 4)) // Show only top 4
        setStats(statsData)
      } catch (err) {
        console.error('Error fetching distributors:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-electric-purple" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeCount = stats?.active || 0
  const inactiveCount = stats?.inactive || 0

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full p-2 bg-gradient-to-r from-electric-blue to-electric-purple">
            <Users className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-electric-blue to-electric-purple bg-clip-text text-transparent">
            Active Distributors
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-r from-electric-green/10 to-electric-cyan/10">
              <div className="flex items-center gap-1">
                <UserCheck className="h-4 w-4 text-electric-green" />
                <span className="text-xs font-medium">Active</span>
              </div>
              <span className="text-lg font-bold text-electric-green">{activeCount}</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-r from-electric-orange/10 to-electric-pink/10">
              <div className="flex items-center gap-1">
                <UserX className="h-4 w-4 text-electric-orange" />
                <span className="text-xs font-medium">Inactive</span>
              </div>
              <span className="text-lg font-bold text-electric-orange">{inactiveCount}</span>
            </div>
          </div>

          {/* Distributor List */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {distributors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No distributors found</p>
              </div>
            ) : (
              distributors.map((distributor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`/placeholder.svg?height=36&width=36&query=${distributor.name}`}
                        alt={distributor.name}
                      />
                      <AvatarFallback>
                        {distributor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{distributor.name}</div>
                      <div className="text-xs text-muted-foreground">{distributor.location}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={distributor.status === "active" ? "default" : "destructive"}
                      className={
                        distributor.status === "active"
                          ? "bg-gradient-to-r from-electric-green to-electric-cyan border-0"
                          : "bg-gradient-to-r from-electric-orange to-electric-pink border-0"
                      }
                    >
                      {distributor.status.charAt(0).toUpperCase() + distributor.status.slice(1)}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {distributor.usedKeys}/{distributor.assignedKeys} keys
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
