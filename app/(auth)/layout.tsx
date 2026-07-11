import Link from "next/link"
import { Logo } from "@/components/ui/Logo"
import { GuestGuard } from "@/components/layout/GuestGuard"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <GuestGuard>
      <div className="flex w-full flex-col lg:flex-row">
        {/* Left Side - Brand/Image */}
        <div className="relative hidden w-1/2 lg:flex flex-col bg-muted p-10 text-white">
          <div className="absolute inset-0 bg-black">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" 
              alt="Cityscape" 
              className="h-full w-full object-cover opacity-50 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
          <div className="relative z-10">
            <Logo height={44} variant="white" asLink={false} />
          </div>
          <div className="relative z-10 mt-auto">
            <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">Institutional Grade Real Estate</Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Master your urban assets <br />with precision.
            </h1>
            <p className="text-lg text-gray-300 max-w-md">
              Join the premier ecosystem for real estate investors, property managers, and high-intent buyers.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
               <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                 <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Global Assets</div>
                 <div className="text-2xl font-bold">$4.2B+</div>
               </div>
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                 <div className="text-xs uppercase tracking-widest text-gray-300 mb-1">Active Users</div>
                 <div className="text-2xl font-bold">12k+</div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full flex-col lg:w-1/2 p-4 sm:p-8 md:p-12 lg:p-24 overflow-y-auto">
           <div className="flex lg:hidden items-center gap-2 mb-8">
            <Logo height={40} />
          </div>
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            {children}
          </div>
          
          <div className="mt-8 text-center text-xs text-muted-foreground">
             <Link href="/" className="hover:text-primary">Return to Home</Link>
          </div>
        </div>
      </div>
    </GuestGuard>
    </div>
  )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </div>
  )
}
