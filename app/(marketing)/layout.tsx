import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { MarketingGuard } from "@/components/layout/MarketingGuard"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <MarketingGuard />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
