"use client"

import { Button } from "@/components/ui/button"
import { signOut } from "@/app/auth/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, LogOut } from "lucide-react"

export function UserAuthButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut()
    router.refresh()
  }

  // Navigation to auth page handled by parent component

  return (
    <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </>
      )}
    </Button>
  )
}

