"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Shield, UserX, CheckCircle, XCircle, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export default function AdminUsersPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")

  const fetchUsers = async () => {
    try {
      const roleQuery = roleFilter !== "All" ? `&role=${roleFilter}` : ""
      const res = await api.get(`/admin/users?limit=50&search=${searchTerm}${roleQuery}`)
      setUsers(res.data.users)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter])

  const toggleBlock = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked'
    try {
      await api.put(`/admin/users/${userId}`, { status: newStatus })
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u))
    } catch (error) {
      console.error("Failed to update user status:", error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await api.delete(`/admin/users/${userId}`)
        setUsers(users.filter(u => u._id !== userId))
      } catch (error) {
        console.error("Failed to delete user:", error)
        alert("Failed to delete user.")
      }
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">View all registered users and manage their roles and access.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b">
          <div className="flex gap-4 w-full max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users by name or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Buyer">Buyer</option>
              <option value="Owner">Owner</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm text-muted-foreground">{u.role}</span>
                          {u.status === 'Blocked' && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 w-fit bg-red-100 text-red-700">
                              <XCircle className="h-3 w-3"/>
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={u.status === 'Blocked' ? 'text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50' : 'text-orange-600 hover:text-orange-700 border-orange-200 hover:bg-orange-50'}
                          onClick={() => toggleBlock(u._id, u.status || 'Active')}
                          disabled={u._id === user?._id}
                        >
                          {u.status === 'Blocked' ? 'Unblock' : 'Block'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 w-8 h-8"
                          onClick={() => deleteUser(u._id)}
                          disabled={u._id === user?._id}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
