"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, truncateText } from "@/lib/utils"
import { formatDateTime } from "@/lib/date-utils"
import { getStatusColor, getStatusDisplay } from "@/lib/earnings-calculator"
import { Search, Filter, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Earning {
  id: string
  studyTitle: string
  reward: number
  bonus: number
  totalEarning: number
  rewardCurrency: string
  status: string
  startedAt: string | null
  completedAt: string | null
  source: string
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/earnings")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setEarnings(data)
    } catch (error) {
      toast.error("Failed to load earnings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this earning?")) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/earnings/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      setEarnings(earnings.filter((e) => e.id !== id))
      toast.success("Earning deleted")
    } catch (error) {
      toast.error("Failed to delete earning")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredEarnings = earnings.filter((earning) => {
    const matchesSearch = earning.studyTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || earning.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalEarnings = filteredEarnings
    .filter((e) => e.status === "APPROVED" || e.status === "SCREENED OUT")
    .reduce((sum, e) => sum + e.totalEarning, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Earnings</h1>
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            {earnings.length} total studies
          </p>
        </div>
        <Link href="/add">
          <Button>Add Entry</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="AWAITING REVIEW">Awaiting Review</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="SCREENED OUT">Screened Out</SelectItem>
                <SelectItem value="TIMED-OUT">Timed Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Showing {filteredEarnings.length} of {earnings.length} studies
            </span>
            <span className="text-lg font-semibold">
              Total: {formatCurrency(totalEarnings, "GBP")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Earnings List */}
      <Card>
        <CardContent className="pt-6">
          {filteredEarnings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {earnings.length === 0 ? (
                <>
                  <p className="mb-4">No earnings yet</p>
                  <Link href="/upload">
                    <Button>Upload CSV</Button>
                  </Link>
                </>
              ) : (
                <p>No earnings match your filters</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {truncateText(earning.studyTitle, 60)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getStatusColor(earning.status)}>
                        {getStatusDisplay(earning.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {earning.startedAt ? formatDateTime(earning.startedAt) : "No date"}
                      </span>
                      {earning.source === "csv_import" && (
                        <Badge variant="secondary" className="text-xs">
                          CSV
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(earning.totalEarning, earning.rewardCurrency)}
                      </p>
                      {earning.bonus > 0 && (
                        <p className="text-xs text-green-600">
                          +{formatCurrency(earning.bonus, earning.rewardCurrency)} bonus
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(earning.id)}
                      disabled={deletingId === earning.id}
                    >
                      {deletingId === earning.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
