"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft, Send, Loader2 } from "lucide-react"
import { getDistributorList, transferKeysToDb } from "@/lib/api"
import type { Distributor } from "@/lib/api"
import { toast } from "sonner"

export function TransferToSSCard() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [selectedDistributor, setSelectedDistributor] = useState("")
  const [keyCount, setKeyCount] = useState("100")
  const [loading, setLoading] = useState(true)
  const [transferring, setTransferring] = useState(false)

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        setLoading(true)
        const distributorsData = await getDistributorList()
        // Only show active distributors
        const activeDistributors = distributorsData.filter(d => d.status === 'active')
        setDistributors(activeDistributors)
      } catch (err) {
        console.error('Error fetching distributors:', err)
        toast.error('Failed to load distributors')
      } finally {
        setLoading(false)
      }
    }

    fetchDistributors()
  }, [])

  const handleTransfer = async () => {
    if (!selectedDistributor || !keyCount || Number(keyCount) <= 0) {
      toast.error('Please select a distributor and enter a valid key count')
      return
    }

    try {
      setTransferring(true)
      await transferKeysToDb(selectedDistributor, Number(keyCount))
      toast.success('Keys transferred successfully')
      setKeyCount("100")
      setSelectedDistributor("")
    } catch (err) {
      console.error('Error transferring keys:', err)
      toast.error('Failed to transfer keys. Please try again.')
    } finally {
      setTransferring(false)
    }
  }

  const selectedDistributorData = distributors.find(d => d._id === selectedDistributor)

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-electric-orange/10 to-electric-pink/10 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-electric-orange/20 to-electric-pink/20 rounded-full -translate-y-14 translate-x-14"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Transfer to Distributor</CardTitle>
        <div className="rounded-full p-3 bg-gradient-to-r from-electric-orange to-electric-pink shadow-lg">
          <ArrowRightLeft className="h-5 w-5 text-white" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="distributorId" className="text-sm font-medium">
            Distributor
          </Label>
          <Select 
            value={selectedDistributor} 
            onValueChange={setSelectedDistributor}
            disabled={loading}
          >
            <SelectTrigger
              id="distributorId"
              className="border-electric-orange/30 focus:border-electric-orange focus:ring-electric-orange/20"
            >
              <SelectValue placeholder={loading ? "Loading..." : "Select Distributor"} />
            </SelectTrigger>
            <SelectContent>
              {distributors.map((distributor) => (
                <SelectItem key={distributor._id} value={distributor._id}>
                  {distributor.name} - {distributor.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDistributorData && (
            <div className="text-xs text-muted-foreground">
              Available: {(selectedDistributorData.assignedKeys - selectedDistributorData.usedKeys).toLocaleString()} keys
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="keyCount" className="text-sm font-medium">
            Number of Keys
          </Label>
          <Input
            id="keyCount"
            type="number"
            value={keyCount}
            onChange={(e) => setKeyCount(e.target.value)}
            className="border-electric-orange/30 focus:border-electric-orange focus:ring-electric-orange/20"
            placeholder="Enter quantity"
            min="1"
          />
        </div>
        <Button
          size="sm"
          onClick={handleTransfer}
          disabled={transferring || loading || !selectedDistributor || !keyCount}
          className="w-full bg-gradient-to-r from-electric-orange to-electric-pink hover:from-electric-orange/80 hover:to-electric-pink/80 text-white"
        >
          {transferring ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Transferring...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-1" />
              Transfer Keys
            </>
          )}
        </Button>
        <div className="text-xs text-muted-foreground">
          {distributors.length > 0 
            ? `${distributors.length} active distributor${distributors.length !== 1 ? 's' : ''} available`
            : 'No active distributors available'
          }
        </div>
      </CardContent>
    </Card>
  )
}
