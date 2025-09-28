"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeftRight, Wallet, ArrowUpDown, Loader2, AlertCircle } from "lucide-react"
import { getSsDashboardSummary } from "@/lib/api"
import type { SsDashboardSummary } from "@/lib/api"

export function TransferredBalanceKeysCard() {
  const [data, setData] = useState<SsDashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const summary = await getSsDashboardSummary()
        setData(summary)
      } catch (err) {
        console.error('Error fetching dashboard summary:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-cyan/10 to-electric-green/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-electric-cyan" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-cyan/10 to-electric-green/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const transferredKeys = data?.transferredKeys || 0
  const balanceKeys = data?.balanceKeys || 0
  const totalKeys = transferredKeys + balanceKeys
  const allocationPercentage = totalKeys > 0 ? Math.round((transferredKeys / totalKeys) * 100) : 0

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-cyan/10 to-electric-green/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric-cyan/30 to-electric-green/30 rounded-full -translate-y-12 translate-x-12"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Transferred Keys
        </CardTitle>
        <div className="rounded-full p-3 bg-gradient-to-r from-electric-cyan to-electric-green shadow-lg">
          <ArrowLeftRight className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-electric-cyan to-electric-green bg-clip-text text-transparent">
          {transferredKeys.toLocaleString()}
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-electric-blue" />
              <span>Allocation Status</span>
            </div>
            <span className="font-medium text-electric-cyan">{data?.transferStatus || 0}%</span>
          </div>
          <Progress value={allocationPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3 text-electric-cyan" />
              <span>Transferred: {transferredKeys.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Wallet className="h-3 w-3 text-electric-green" />
              <span>Balance: {balanceKeys.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
