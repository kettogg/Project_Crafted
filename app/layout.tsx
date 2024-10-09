import "@/styles/globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"

import { type ReactNode } from "react"

import { Providers } from "@/components/providers"
import Navbar from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Crafted",
  description: "NFT Marketplace!",
}

export default function RootLayout(props: { children: ReactNode }) {
  const cookie = headers().get("cookie") ?? ""
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers cookie={cookie}>
          <Navbar />
          {props.children}
        </Providers>
      </body>
    </html>
  )
}
