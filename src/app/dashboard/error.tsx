'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Dashboard Error Boundary Caught:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center rounded-xl border border-red-100 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Something went wrong!
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        We encountered an error while loading this section of the dashboard. Your data is safe, but we couldn&apos;t display it right now.
      </p>
      <Button 
        onClick={() => reset()}
        className="bg-red-600 hover:bg-red-700 text-white gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  )
}
