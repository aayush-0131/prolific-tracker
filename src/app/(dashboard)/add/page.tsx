"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AddEntryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    studyTitle: "",
    reward: "",
    rewardCurrency: "GBP",
    bonus: "",
    status: "APPROVED",
    startedAt: "",
    completedAt: "",
    completionCode: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studyTitle || !formData.reward) {
      toast.error("Please fill in study title and reward")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/earnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyTitle: formData.studyTitle,
          reward: parseFloat(formData.reward),
          rewardCurrency: formData.rewardCurrency,
          bonus: formData.bonus ? parseFloat(formData.bonus) : 0,
          status: formData.status,
          startedAt: formData.startedAt || undefined,
          completedAt: formData.completedAt || undefined,
          completionCode: formData.completionCode || undefined,
          notes: formData.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to add earning")
        return
      }

      toast.success("Earning added successfully!")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Entry</h1>
        <p className="text-muted-foreground">
          Manually add a Prolific earning
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>New Earning</CardTitle>
          <CardDescription>
            Enter the details of your completed study
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Study Title */}
            <div className="space-y-2">
              <Label htmlFor="studyTitle">Study Title *</Label>
              <Input
                id="studyTitle"
                placeholder="e.g., Survey about daily habits"
                value={formData.studyTitle}
                onChange={(e) => setFormData({ ...formData, studyTitle: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            {/* Reward & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward">Reward *</Label>
                <Input
                  id="reward"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.rewardCurrency}
                  onValueChange={(value) => setFormData({ ...formData, rewardCurrency: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bonus */}
            <div className="space-y-2">
              <Label htmlFor="bonus">Bonus (optional)</Label>
              <Input
                id="bonus"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="AWAITING REVIEW">Awaiting Review</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="SCREENED OUT">Screened Out</SelectItem>
                  <SelectItem value="TIMED-OUT">Timed Out</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startedAt">Started At (optional)</Label>
                <Input
                  id="startedAt"
                  type="datetime-local"
                  value={formData.startedAt}
                  onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="completedAt">Completed At (optional)</Label>
                <Input
                  id="completedAt"
                  type="datetime-local"
                  value={formData.completedAt}
                  onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Completion Code */}
            <div className="space-y-2">
              <Label htmlFor="completionCode">Completion Code (optional)</Label>
              <Input
                id="completionCode"
                placeholder="e.g., ABC123XYZ"
                value={formData.completionCode}
                onChange={(e) => setFormData({ ...formData, completionCode: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isLoading}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Earning"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
