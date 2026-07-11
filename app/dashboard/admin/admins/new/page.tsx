"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Shield } from "lucide-react"
import api from "@/lib/api"

export default function AddAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await api.post("/admin/admins", formData)
      alert("Admin user created successfully!")
      router.push("/dashboard/admin/users")
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to create admin. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 pb-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Admin</h1>
          <p className="text-muted-foreground">Create a new administrator account with full access.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Admin Credentials
          </CardTitle>
          <CardDescription>Enter the details for the new administrator.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input 
                  name="firstName" 
                  required 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input 
                  name="lastName" 
                  required 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="admin@urbaniq.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number (Optional)</label>
              <Input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password" 
                name="password" 
                required 
                minLength={6}
                value={formData.password} 
                onChange={handleChange} 
                placeholder="Secure password"
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? "Creating..." : "Create Admin Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
