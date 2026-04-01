"use client"

import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { KofiButton } from "@/components/ui/kofi-button"
import { getInitials } from "@/lib/utils"
import { LogOut, Download, Loader2, Save, Target } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const initialized = useRef(false)

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currency: "GBP",
    weeklyGoal: 60,
    fiscalYearStart: 1,
  })

  useEffect(() => {
    if (session?.user && !initialized.current) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        currency: (session.user as any).currency || "GBP",
        weeklyGoal: (session.user as any).weeklyGoal || 60,
        fiscalYearStart: (session.user as any).fiscalYearStart || 1,
      })
      initialized.current = true
    }
  }, [session])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileData.name || !profileData.email) {
      toast.error("Name and email are required")
      return
    }

    if (profileData.weeklyGoal < 0) {
      toast.error("Weekly goal must be positive")
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          currency: profileData.currency,
          weeklyGoal: profileData.weeklyGoal,
          fiscalYearStart: profileData.fiscalYearStart,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to update profile")
        return
      }

      setProfileData({
        name: data.user.name,
        email: data.user.email,
        currency: data.user.currency,
        weeklyGoal: parseFloat(data.user.weeklyGoal),
        fiscalYearStart: data.user.fiscalYearStart,
      })

      toast.success("Settings updated successfully!", {
        duration: 5000,
      })

    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("All password fields are required")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to change password")
        return
      }

      toast.success("Password changed successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/earnings")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()

      const csv = [
        ["Study", "Reward", "Bonus", "Currency", "Status", "Started At", "Completed At"],
        ...data.map((e: any) => [
          `"${e.studyTitle}"`,
          e.reward,
          e.bonus,
          e.rewardCurrency,
          e.status,
          e.startedAt || "",
          e.completedAt || ""
        ])
      ].map(row => row.join(",")).join("\n")

      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `prolific-earnings-${new Date().toISOString().split("T")[0]}.csv`
      a.click()

      toast.success("Data exported successfully!")
    } catch (error) {
      toast.error("Failed to export data")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Ko-fi Support Card - NEW! */}
      <KofiButton variant="card" />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="text-2xl bg-blue-600 text-white">
                {getInitials(profileData.name || profileData.email || "U")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold">{profileData.name}</p>
              <p className="text-muted-foreground">{profileData.email}</p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Your name"
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="your@email.com"
                  disabled={isUpdating}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select
                  value={profileData.currency}
                  onValueChange={(value) => setProfileData({ ...profileData, currency: value })}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GBP">£ GBP (British Pound)</SelectItem>
                    <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Tax Year Start</Label>
                <Select
                  value={profileData.fiscalYearStart.toString()}
                  onValueChange={(value) => setProfileData({ ...profileData, fiscalYearStart: parseInt(value) })}
                  disabled={isUpdating}
                >
                  <SelectTrigger id="fiscalYear">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">January (US/Calendar Year)</SelectItem>
                    <SelectItem value="4">April (UK Tax Year)</SelectItem>
                    <SelectItem value="7">July (Australia)</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used for "This Year" calculations in analytics
                </p>
              </div>
            </div>

            <Separator />

            {/* Weekly Goal - NEW! */}
            <div className="space-y-2">
              <Label htmlFor="weeklyGoal" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Weekly Earnings Goal
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-lg">{profileData.currency === "GBP" ? "£" : "$"}</span>
                <Input
                  id="weeklyGoal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={profileData.weeklyGoal}
                  onChange={(e) => setProfileData({ ...profileData, weeklyGoal: parseFloat(e.target.value) || 0 })}
                  placeholder="60.00"
                  disabled={isUpdating}
                  className="max-w-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set your target weekly earnings. You'll see progress on your dashboard.
              </p>
            </div>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                disabled={isChangingPassword}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                disabled={isChangingPassword}
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                disabled={isChangingPassword}
              />
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Download all your earnings data as CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportData} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
