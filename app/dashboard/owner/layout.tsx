import { RoleGuard } from "@/components/layout/RoleGuard"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RoleGuard allowedRoles={['Owner']}>{children}</RoleGuard>
}
