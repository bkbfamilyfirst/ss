"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Loader2, AlertCircle } from "lucide-react"
import { getDistributorList } from "@/lib/api"
import type { Distributor } from "@/lib/api"

export function SSAllocationCard() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const distributorsData = await getDistributorList()
        setDistributors(distributorsData.slice(0, 5)) // Show only top 5
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
          <Loader2 className="h-6 w-6 animate-spin text-electric-green" />
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

  const totalAllocated = distributors.reduce((sum, d) => sum + d.receivedKeys, 0)
  const totalUsed = distributors.reduce((sum, d) => sum + d.transferredKeys, 0)

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full p-2 bg-gradient-to-r from-electric-green to-electric-cyan">
            <PieChart className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-electric-green to-electric-cyan bg-clip-text text-transparent">
            Distributor Allocation & Usage
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-r from-electric-purple/10 to-electric-blue/10">
              <span className="text-xs font-medium">Total Distributors</span>
              <span className="text-lg font-bold text-electric-purple">{distributors.length}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-r from-electric-green/10 to-electric-cyan/10">
              <span className="text-xs font-medium">Allocated</span>
              <span className="text-lg font-bold text-electric-green">
                {totalAllocated.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-r from-electric-orange/10 to-electric-pink/10">
              <span className="text-xs font-medium">Used</span>
              <span className="text-lg font-bold text-electric-orange">
                {totalUsed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Distributor List with Usage */}
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
            {distributors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No distributors found</p>
              </div>
            ) : (
              distributors.map((distributor, index) => {
                const usagePercentage = distributor.receivedKeys > 0 
                  ? Math.round((distributor.transferredKeys / distributor.receivedKeys) * 100) 
                  : 0
                let progressColor = "bg-electric-green"

                if (usagePercentage >= 80) {
                  progressColor = "bg-electric-pink"
                } else if (usagePercentage >= 50) {
                  progressColor = "bg-electric-orange"
                }

                return (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{distributor.name}</div>
                        <div className="text-xs text-muted-foreground">{distributor.address}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {distributor.transferredKeys.toLocaleString()}</span>
                        <span>Allocated: {distributor.receivedKeys.toLocaleString()}</span>
                      </div>
                      <Progress value={usagePercentage} className={`h-2 ${progressColor}`} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
