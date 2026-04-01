"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Upload,
  PlusCircle,
  BarChart3,
  Settings,
  List,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Earnings", href: "/earnings", icon: List },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Upload CSV", href: "/upload", icon: Upload },
  { name: "Add Entry", href: "/add", icon: PlusCircle },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <span className="ml-3 text-xl font-semibold text-gray-900">
            Prolific Tracker
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 flex-shrink-0 h-5 w-5",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500">
            Made for Prolific participants
          </div>
        </div>
      </div>
    </div>
  )
}
