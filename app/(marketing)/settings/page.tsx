"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserCircle, Shield } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: "", type: "" })
    
    try {
      const { data } = await api.put("/users/me", formData)
      updateUser(data) // update global store
      setMessage({ text: "Profile updated successfully!", type: "success" })
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || "Failed to update profile", 
        type: "error" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return <div className="p-8">Loading...</div>

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">Account Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-sm">
            <UserCircle className="h-10 w-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-muted-foreground mb-1">{user.email}</p>
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold capitalize">
              {user.role} Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange}
                required
                className="h-12"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email Address (Cannot be changed)</label>
            <Input 
              value={user.email} 
              disabled
              className="h-12 bg-muted/50 cursor-not-allowed text-muted-foreground"
            />
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isLoading} className="h-12 px-8 font-semibold">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      {user.role === 'Admin' && (
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Administrative Actions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage high-level administrative tasks and platform access.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Button asChild variant="outline" className="h-12 px-6 font-semibold border-primary/20 text-primary hover:bg-primary/5">
              <Link href="/dashboard/admin/admins/new">
                Create New Admin Account
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
