import './globals.css'
import { type ReactNode } from 'react'
import { Inter } from 'next/font/google'

import { Providers } from './providers'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Compound Supplier',
}

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  )
}
