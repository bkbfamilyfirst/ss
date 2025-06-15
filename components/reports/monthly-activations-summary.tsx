"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, BarChart3, LineChart, PieChart, Calendar, TrendingUp, TrendingDown, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { getSsDashboardSummary, getDistributorStats } from "@/lib/api"
import type { SsDashboardSummary, DistributorStats } from "@/lib/api"

export function MonthlyActivationsSummary() {
  const [dashboardData, setDashboardData] = useState<SsDashboardSummary | null>(null)
  const [distributorStats, setDistributorStats] = useState<DistributorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [year, setYear] = useState("2024")
  const [viewType, setViewType] = useState("monthly")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [summary, stats] = await Promise.all([
          getSsDashboardSummary(),
          getDistributorStats()
        ])
        setDashboardData(summary)
        setDistributorStats(stats)
      } catch (err) {
        console.error('Error fetching activation data:', err)
        setError('Failed to load activation data')
        toast.error('Failed to load activation data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-electric-purple" />
              <span className="text-sm text-muted-foreground">Loading activation data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <span className="text-sm text-muted-foreground text-center">{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData || !distributorStats) return null

  // Calculate performance metrics from weekly data
  const weeklyPerformance = dashboardData.dailyActivations.weeklyPerformance || []
  const totalWeeklyActivations = weeklyPerformance.reduce((sum, val) => sum + val, 0)
  const avgDaily = dashboardData.dailyActivations.avgDaily || 0
  const todayActivations = dashboardData.dailyActivations.today || 0

  // Calculate growth rate from weekly performance data
  const lastWeekValue = weeklyPerformance[weeklyPerformance.length - 1] || 0
  const previousWeekValue = weeklyPerformance[weeklyPerformance.length - 2] || 0
  const growthRate = previousWeekValue ? ((lastWeekValue - previousWeekValue) / previousWeekValue) * 100 : 0
  const isGrowthPositive = growthRate >= 0

  // Regional distribution based on distributor stats and retailer count
  const regionalData = [
    { 
      region: "North Region", 
      activations: dashboardData.retailerCount.regionalDistribution.north * 15, // Estimate activations per retailer
      percentage: Math.round((dashboardData.retailerCount.regionalDistribution.north / distributorStats.total) * 100) 
    },
    { 
      region: "South Region", 
      activations: dashboardData.retailerCount.regionalDistribution.south * 15,
      percentage: Math.round((dashboardData.retailerCount.regionalDistribution.south / distributorStats.total) * 100) 
    },
    { 
      region: "East Region", 
      activations: dashboardData.retailerCount.regionalDistribution.east * 15,
      percentage: Math.round((dashboardData.retailerCount.regionalDistribution.east / distributorStats.total) * 100) 
    },
    { 
      region: "West Region", 
      activations: dashboardData.retailerCount.regionalDistribution.west * 15,
      percentage: Math.round((dashboardData.retailerCount.regionalDistribution.west / distributorStats.total) * 100) 
    }
  ]

  // Mock device data (since not available in API)
  const deviceData = [
    { type: "Android", activations: Math.round(totalWeeklyActivations * 0.55), percentage: 55 },
    { type: "iOS", activations: Math.round(totalWeeklyActivations * 0.37), percentage: 37 },
    { type: "Windows", activations: Math.round(totalWeeklyActivations * 0.06), percentage: 6 },
    { type: "Other", activations: Math.round(totalWeeklyActivations * 0.02), percentage: 2 },
  ]

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activations (This Week)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-electric-purple to-electric-blue bg-clip-text text-transparent">
              {totalWeeklyActivations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Weekly performance total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${isGrowthPositive ? 'text-electric-green' : 'text-electric-orange'}`}>
                {isGrowthPositive ? '+' : ''}{growthRate.toFixed(1)}%
              </div>
              {isGrowthPositive ? (
                <TrendingUp className="h-4 w-4 text-electric-green" />
              ) : (
                <TrendingDown className="h-4 w-4 text-electric-orange" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Week-over-week change
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-electric-orange to-electric-pink bg-clip-text text-transparent">
              {avgDaily.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data Visualization */}
      <Tabs value={viewType} onValueChange={setViewType} className="w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="regional" className="flex items-center gap-2">
              <PieChart className="h-3.5 w-3.5" />
              Regional
            </TabsTrigger>
            <TabsTrigger value="device" className="flex items-center gap-2">
              <LineChart className="h-3.5 w-3.5" />
              Device Types
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-electric-purple" />
                Weekly Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyPerformance.map((value, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">Day {index + 1}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-electric-purple to-electric-blue h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max((value / Math.max(...weeklyPerformance)) * 100, 5)}%` }}
                      ></div>
                    </div>
                    <div className="w-16 text-sm font-medium text-right">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-electric-purple">{todayActivations}</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-electric-blue">{avgDaily}</div>
                    <div className="text-xs text-muted-foreground">Avg Daily</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-electric-green">{Math.max(...weeklyPerformance)}</div>
                    <div className="text-xs text-muted-foreground">Peak Day</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-electric-orange">{totalWeeklyActivations}</div>
                    <div className="text-xs text-muted-foreground">Week Total</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-electric-green" />
                Regional Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-electric-purple to-electric-blue"></div>
                      <span className="text-sm font-medium">{region.region}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold">{region.activations.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {region.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="device" className="space-y-4">
          <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-electric-orange" />
                Device Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceData.map((device, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium">{device.type}</div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-electric-orange to-electric-pink h-2 rounded-full transition-all duration-300"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-16 text-sm font-medium text-right">{device.activations.toLocaleString()}</div>
                    <div className="w-12 text-xs text-muted-foreground">{device.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}