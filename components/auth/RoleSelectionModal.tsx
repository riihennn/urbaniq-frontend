"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Building, Home, UserCheck, Loader2 } from "lucide-react"

interface RoleSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (role: string) => Promise<void>
}

export default function RoleSelectionModal({ isOpen, onClose, onConfirm }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState("Buyer")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(selectedRole)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg p-6 bg-background rounded-2xl shadow-xl border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col space-y-4">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight">Complete your profile</h2>
            <p className="text-sm text-muted-foreground">
              To finish signing up with Google, please select your account type below.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 py-2">
            <label 
              className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${
                selectedRole === "Buyer" 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-7 w-7 mb-2" />
              <span className="text-xs font-semibold text-center">Buyer / Tenant</span>
              <input 
                type="radio" 
                name="modalRole" 
                value="Buyer" 
                className="hidden" 
                checked={selectedRole === "Buyer"} 
                onChange={() => setSelectedRole("Buyer")} 
              />
            </label>

            <label 
              className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${
                selectedRole === "Owner" 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building className="h-7 w-7 mb-2" />
              <span className="text-xs font-semibold text-center">Owner</span>
              <input 
                type="radio" 
                name="modalRole" 
                value="Owner" 
                className="hidden" 
                checked={selectedRole === "Owner"} 
                onChange={() => setSelectedRole("Owner")} 
              />
            </label>

            <label 
              className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all ${
                selectedRole === "Agent" 
                  ? "border-primary bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-7 w-7 mb-2" />
              <span className="text-xs font-semibold text-center">Agent</span>
              <input 
                type="radio" 
                name="modalRole" 
                value="Agent" 
                className="hidden" 
                checked={selectedRole === "Agent"} 
                onChange={() => setSelectedRole("Agent")} 
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
              className="h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={loading}
              className="h-11 px-6 min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Finish Sign Up"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
