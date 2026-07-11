"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { UserCircle, LogOut, LayoutDashboard, ChevronDown, Settings, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/ui/Logo"
import { NotificationBell } from "@/components/ui/NotificationBell"

export function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    router.push('/')
  }

  const getDashboardPath = () => {
    if (!user) return "/login"
    return `/dashboard/${user.role.toLowerCase()}`
  }

  const getLogoPath = () => {
    if (user && (user.role === 'Agent' || user.role === 'Admin')) {
      return `/dashboard/${user.role.toLowerCase()}`
    }
    return "/"
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-8 mx-auto">
        <div className="flex items-center gap-2">
          <Logo height={44} href={getLogoPath()} />
          {/* Links back in their original place */}
          {!user && (
            <nav className="hidden md:flex gap-6 ml-6">
              <Link
                href="/properties"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Properties
              </Link>
              <Link
                href="/register?role=agent"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                For Agents
              </Link>
              <Link
                href="/register?role=owner"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                For Owners
              </Link>
            </nav>
          )}
          {user && (user.role === 'Buyer' || user.role === 'Owner') && (
            <nav className="hidden md:flex gap-6 ml-6">
              <Link
                href="/properties"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Browse Properties
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link 
                href={`/dashboard/${user.role.toLowerCase()}/inquiries`}
                className="relative p-2 rounded-full hover:bg-muted transition-colors flex items-center"
                title="Messages"
              >
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </Link>
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 hover:bg-muted py-2 px-3 rounded-full transition-colors"
              >
                <UserCircle className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium hidden sm:block">{user.firstName}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-background border rounded-xl shadow-xl overflow-hidden z-50 flex flex-col py-2">
                  <div className="px-4 py-3 border-b bg-muted/20">
                    <p className="font-semibold text-sm truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <Link 
                    href={getDashboardPath()} 
                    className="flex items-center px-4 py-3 text-sm hover:bg-muted transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3 text-muted-foreground" />
                    Dashboard
                  </Link>
                  <Link 
                    href="/settings" 
                    className="flex items-center px-4 py-3 text-sm hover:bg-muted transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                    Settings
                  </Link>
                  <div className="h-px bg-border my-1"></div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
                Sign In
              </Link>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
