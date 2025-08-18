'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthCookie } from '@/utils/cookies'

export default function ProtectedRoute({ children }) {
  const router = useRouter()

  useEffect(() => {
    const token = getAuthCookie()
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return children
}
