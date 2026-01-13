'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/components/LoginPage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth-token='))
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  return <LoginPage />
}

