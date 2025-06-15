"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import { getSsDashboardSummary } from "@/lib/api"
import type { SsDashboardSummary } from "@/lib/api"

export function TotalReceivedKeysCard() {
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
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-purple/10 to-electric-blue/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-purple/20 to-electric-blue/20 rounded-full -translate-y-16 translate-x-16"></div>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-electric-purple" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-purple/10 to-electric-blue/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-purple/20 to-electric-blue/20 rounded-full -translate-y-16 translate-x-16"></div>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-purple/10 to-electric-blue/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-electric-purple/20 to-electric-blue/20 rounded-full -translate-y-16 translate-x-16"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Received Keys</CardTitle>
        <div className="rounded-full p-3 bg-gradient-to-r from-electric-purple to-electric-blue shadow-lg">
          <Key className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold bg-gradient-to-r from-electric-purple to-electric-blue bg-clip-text text-transparent">
          {data?.receivedKeys?.toLocaleString() || '0'}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {data?.receivedKeysDetails?.changeFromLastWeek !== undefined && data.receivedKeysDetails.changeFromLastWeek >= 0 ? (
            <TrendingUp className="h-4 w-4 text-electric-green" />
          ) : null}
          <p className="text-sm text-electric-green font-medium">
            {data?.receivedKeysDetails?.changeFromLastWeek !== undefined 
              ? `${data.receivedKeysDetails.changeFromLastWeek >= 0 ? '+' : ''}${data.receivedKeysDetails.changeFromLastWeek.toFixed(1)}% from last week`
              : 'No data available'
            }
          </p>
        </div>
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>Today: {data?.receivedKeysDetails?.today?.toLocaleString() || '0'}</span>
          <span>This Week: {data?.receivedKeysDetails?.thisWeek?.toLocaleString() || '0'}</span>
        </div>
      </CardContent>
    </Card>
  )
}
