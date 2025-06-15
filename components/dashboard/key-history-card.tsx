"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { History, ArrowDownUp, ArrowUp, ArrowDown, Calendar, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { getSsKeyTransferLogs } from "@/lib/api"
import type { KeyTransferLog } from "@/lib/api"

export function KeyHistoryCard() {
  const [keyHistory, setKeyHistory] = useState<KeyTransferLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("all")
  const [tab, setTab] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    const fetchKeyHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Calculate date range based on period
        let startDate: string | undefined
        const now = new Date()
        
        if (period === "week") {
          const weekAgo = new Date()
          weekAgo.setDate(now.getDate() - 7)
          startDate = weekAgo.toISOString().split('T')[0]
        } else if (period === "month") {
          const monthAgo = new Date()
          monthAgo.setMonth(now.getMonth() - 1)
          startDate = monthAgo.toISOString().split('T')[0]
        } else if (period === "quarter") {
          const quarterAgo = new Date()
          quarterAgo.setMonth(now.getMonth() - 3)
          startDate = quarterAgo.toISOString().split('T')[0]        }        // For the API call, let's not filter by type initially and handle filtering on the client side
        // This ensures we get all transactions and can properly categorize them
        const response = await getSsKeyTransferLogs(
          page,
          pageSize,
          startDate,
          undefined, // endDate
          undefined, // status
          undefined, // type - let's get all types and filter client-side          undefined  // search
        )
        
        setKeyHistory(response.logs)
        setTotalRecords(response.total)
      } catch (err) {
        console.error('Error fetching key history:', err)
        setError('Failed to load key history')      } finally {
        setLoading(false)
      }
    }

    fetchKeyHistory()
  }, [period, tab, page, pageSize])
  const getLogType = (log: KeyTransferLog): "sent" | "received" => {
    // For a State Supervisor:
    // - "received" means keys came TO the SS (SS is the recipient)
    // - "sent" means keys went FROM the SS (SS is the sender)
    
    console.log('Analyzing log:', {
      from: log.from,
      to: log.to,
      type: log.type,
      count: log.count
    });
    
    // Check by role first
    if (log.to?.role === "SS" || log.to?.role === "state_supervisor") {
      return "received";
    } else if (log.from?.role === "SS" || log.from?.role === "state_supervisor") {
      return "sent";
    }
    
    // Check by name patterns - if SS is sending to distributors/database
    if (log.from?.name && (
      log.from.name.toLowerCase().includes("ss") || 
      log.from.name.toLowerCase().includes("state") ||
      log.from.name.toLowerCase().includes("supervisor")
    )) {
      return "sent";
    }
    
    // Check if SS is receiving from distributors/database
    if (log.to?.name && (
      log.to.name.toLowerCase().includes("ss") || 
      log.to.name.toLowerCase().includes("state") ||
      log.to.name.toLowerCase().includes("supervisor")
    )) {
      return "received";
    }
    
    // If the transaction is going TO "db" or similar, it's likely sent FROM SS
    if (log.to?.name && (
      log.to.name.toLowerCase().includes("db") ||
      log.to.name.toLowerCase().includes("distributor")
    )) {
      return "sent";
    }
    
    // If the transaction is coming FROM "db" or similar, it's likely received BY SS
    if (log.from?.name && (
      log.from.name.toLowerCase().includes("db") ||
      log.from.name.toLowerCase().includes("distributor")
    )) {
      return "received";
    }
    
    // Fallback to type field if role/name information is not conclusive
    return log.type === "transfer_out" ? "sent" : "received";
  };

  // Filter data based on current tab
  const getFilteredHistory = () => {
    if (tab === "all") {
      return keyHistory;
    } else if (tab === "received") {
      return keyHistory.filter(log => getLogType(log) === "received");
    } else if (tab === "sent") {
      return keyHistory.filter(log => getLogType(log) === "sent");
    }    return keyHistory;
  };

  const filteredHistory = getFilteredHistory();
  
  // Calculate total pages based on filtered data
  const filteredTotal = filteredHistory.length;
  const totalPages = Math.ceil(filteredTotal / pageSize);
  
  // Reset page if current page is beyond available pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [page, totalPages]);
  
  // For display pagination, we need to slice the filtered data
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);

  const handleTabChange = (val: string) => {
    setTab(val)
    setPage(1)
  }

  const handlePeriodChange = (val: string) => {    setPeriod(val)
    setPage(1)
  }

  if (loading) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-electric-purple" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <CardTitle className="flex items-center gap-2">
          <div className="rounded-full p-2 bg-gradient-to-r from-electric-purple to-electric-pink">
            <History className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-electric-purple to-electric-pink bg-clip-text text-transparent text-sm sm:text-base">
            Key History (Sent/Received)
          </span>
        </CardTitle>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all" className="text-xs">
              <ArrowDownUp className="h-3 w-3 mr-1" />
              All
            </TabsTrigger>
            <TabsTrigger value="received" className="text-xs">
              <ArrowDown className="h-3 w-3 mr-1" />
              Received
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs">
              <ArrowUp className="h-3 w-3 mr-1" />
              Sent
            </TabsTrigger>
          </TabsList>

          {["all", "received", "sent"].map((tabKey) => (
            <TabsContent key={tabKey} value={tabKey} className="mt-0">
              {error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : paginatedHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transfer history found</p>
                </div>
              ) : (
                <>                  {/* Mobile Card Layout */}                  <div className="block md:hidden space-y-3">
                    {paginatedHistory.map((item, index) => {
                      const logType = getLogType(item)
                      return (
                        <div key={index} className="p-4 rounded-lg border bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {logType === "received" ? (
                                <>
                                  <ArrowDown className="h-4 w-4 text-electric-green" />
                                  <span className="text-sm font-medium text-electric-green">Received</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUp className="h-4 w-4 text-electric-orange" />
                                  <span className="text-sm font-medium text-electric-orange">Sent</span>
                                </>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Quantity:</span>
                              <span className="font-medium">{item.count.toLocaleString()}</span>
                            </div>
                            {logType === "sent" && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">To:</span>
                                <span className="text-sm truncate max-w-[150px]">{item.to?.name || "N/A"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden md:block rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">Date</th>
                            <th className="px-4 py-3 text-left font-medium">Type</th>
                            <th className="px-4 py-3 text-left font-medium">Quantity</th>                            {tabKey !== "received" && <th className="px-4 py-3 text-left font-medium">To</th>}
                          </tr>                        </thead>
                        <tbody>
                          {paginatedHistory.map((item, index) => {
                            const logType = getLogType(item)
                            return (
                              <tr key={index} className="border-t hover:bg-muted/30">
                                <td className="px-4 py-3">{new Date(item.timestamp).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1">
                                    {logType === "received" ? (
                                      <>
                                        <ArrowDown className="h-4 w-4 text-electric-green" />
                                        <span className="text-electric-green">Received</span>
                                      </>
                                    ) : (
                                      <>
                                        <ArrowUp className="h-4 w-4 text-electric-orange" />
                                        <span className="text-electric-orange">Sent</span>
                                      </>
                                    )}
                                  </div>
                                </td>                                <td className="px-4 py-3 font-medium">{item.count.toLocaleString()}</td>
                                {tabKey !== "received" && <td className="px-4 py-3">{item.to?.name || "N/A"}</td>}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  <div className="mt-4 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                      </Button>                      <span>
                        Page {page} of {totalPages} ({filteredTotal} total)
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <span>Show:</span>
                      <Select value={String(pageSize)} onValueChange={(val) => { setPageSize(Number(val)); setPage(1) }}>
                        <SelectTrigger className="w-[70px] h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
