import { RoleGuard } from "@/components/layout/RoleGuard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGuard allowedRoles={['Admin']}>{children}</RoleGuard>
}
