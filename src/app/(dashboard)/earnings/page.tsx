"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, truncateText } from "@/lib/utils"
import { formatDateTime } from "@/lib/date-utils"
import { getStatusColor, getStatusDisplay } from "@/lib/earnings-calculator"
import { Search, Trash2, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Earning {
  id: string
  studyTitle: string
  reward: number
  bonus: number
  totalEarning: number
  normalizedGBP: number
  normalizedUSD: number
  rewardCurrency: string
  status: string
  startedAt: string | null
  completedAt: string | null
  source: string
}

type SortField = "date" | "amount" | "title" | "status"
type SortDirection = "asc" | "desc"

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const fetchEarnings = async () => {
    try {
      const response = await fetch("/api/earnings")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setEarnings(data.earnings || []) // ✅ FIX: Extract earnings array
    } catch (error) {
      toast.error("Failed to load earnings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  // Selection handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEarnings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredEarnings.map(e => e.id)))
    }
  }

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    const count = selectedIds.size
    if (!confirm(`Are you sure you want to delete ${count} ${count === 1 ? 'earning' : 'earnings'}?`)) {
      return
    }

    setDeletingBulk(true)
    try {
      const response = await fetch("/api/earnings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      if (!response.ok) throw new Error("Failed to delete")

      const data = await response.json()

      setEarnings(earnings.filter(e => !selectedIds.has(e.id)))
      setSelectedIds(new Set())
      toast.success(data.message || `Deleted ${count} earnings`)
    } catch (error) {
      toast.error("Failed to delete earnings")
    } finally {
      setDeletingBulk(false)
    }
  }

  // Single delete handler
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

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Filter earnings
  const filteredEarnings = earnings
    .filter((earning) => {
      const matchesSearch = earning.studyTitle
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || earning.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "date":
          const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0
          const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0
          comparison = dateA - dateB
          break
        case "amount":
          comparison = a.normalizedGBP - b.normalizedGBP
          break
        case "title":
          comparison = a.studyTitle.localeCompare(b.studyTitle)
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const totalEarnings = filteredEarnings
    .filter((e) => e.status === "APPROVED" || e.status === "SCREENED OUT")
    .reduce((sum, e) => sum + e.normalizedGBP, 0)

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={sortField === field ? "bg-gray-100" : ""}
    >
      {label}
      {sortField === field ? (
        sortDirection === "asc" ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  )

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

      {/* Filters & Sort */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
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

            {/* Sort Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground mr-2">Sort by:</span>
              <SortButton field="date" label="Date" />
              <SortButton field="amount" label="Amount" />
              <SortButton field="title" label="Study Name" />
              <SortButton field="status" label="Status" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary & Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Showing {filteredEarnings.length} of {earnings.length} studies
              </span>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deletingBulk}
                >
                  {deletingBulk ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete {selectedIds.size} selected
                    </>
                  )}
                </Button>
              )}
            </div>
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
              {/* Select All Header */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <Checkbox
                  checked={selectedIds.size === filteredEarnings.length && filteredEarnings.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedIds.size === filteredEarnings.length && filteredEarnings.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </div>

              {/* Earnings Items */}
              {filteredEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                    selectedIds.has(earning.id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <Checkbox
                    checked={selectedIds.has(earning.id)}
                    onCheckedChange={() => toggleSelection(earning.id)}
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {truncateText(earning.studyTitle, 60)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
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
