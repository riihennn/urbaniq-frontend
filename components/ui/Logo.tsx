import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  /** Height of the logo in pixels */
  height?: number
  /** Wrap in a Link to "/" */
  asLink?: boolean
  /** Extra classes on the wrapper */
  className?: string
  /** Use "white" on dark backgrounds — inverts the black logo to white */
  variant?: "default" | "white"
  /** URL to redirect to */
  href?: string
}

export function Logo({
  height = 36,
  asLink = true,
  className = "",
  variant = "default",
  href = "/",
}: LogoProps) {
  // Actual PNG dimensions: 819 x 305 → ratio 2.685:1
  const width = Math.round(height * 2.685)

  const img = (
    <img
      src="/logo.png"
      alt="Urbaniq"
      width={width}
      height={height}
      style={{
        // Only apply inline filter if explicitly forced to white
        filter: variant === "white" ? "invert(1)" : undefined,
        display: "block",
        objectFit: "contain",
      }}
    />
  )

  if (asLink) {
    return (
      <Link href={href} className={`inline-flex items-center shrink-0 ${className}`}>
        {img}
      </Link>
    )
  }

  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      {img}
    </span>
  )
}
