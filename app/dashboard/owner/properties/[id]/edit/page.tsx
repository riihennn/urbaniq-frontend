"use client"

import { useParams } from "next/navigation"
import EditPropertyForm from "@/components/properties/EditPropertyForm"

export default function OwnerEditPropertyPage() {
  const { id } = useParams()

  return <EditPropertyForm propertyId={id as string} role="Owner" />
}
