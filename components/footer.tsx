'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BuildInfo {
  commit: string
  timestamp: string
  timestampFormatted: string
}

export function Footer() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)

  useEffect(() => {
    fetch('/build-info.json')
      .then(res => res.json())
      .then(data => setBuildInfo(data))
      .catch(() => {
        // Fallback if build info not available
        setBuildInfo({
          commit: 'dev',
          timestamp: new Date().toISOString(),
          timestampFormatted: 'Development'
        })
      })
  }, [])

  if (!buildInfo) {
    return null
  }

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span title={`Commit: ${buildInfo.commit}\nBuilt: ${buildInfo.timestamp}`}>
              Build {buildInfo.commit} • {buildInfo.timestampFormatted}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
            >
              About
            </Link>
            <span>•</span>
            <span>
              Created by{' '}
              <a
                href="https://www.pom-pom.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Pom Pom
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
