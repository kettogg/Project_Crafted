import "@coinbase/onchainkit/styles.css"
import "@/styles/globals.css"

import type { Metadata } from "next"
// import { Space_Mono, Space_Grotesk } from "next/font/google"
import localFont from "next/font/local"
import { headers } from "next/headers"

import { type ReactNode } from "react"

import { Providers } from "@/components/providers"
import Navbar from "@/components/navbar"

// const spaceMono = Space_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
//   weight: ["400", "700"],
// })
// const spaceGrotesk = Space_Grotesk({
//   subsets: ["latin"],
//   variable: "--font-sans",
//   weight: ["300", "400", "500", "600", "700"],
// })

const rightGroteskCasual = localFont({
  src: "../assets/fonts/PPRightGrotesk-CasualVariable.ttf",
  variable: "--font-rg-casual",
})
const rightGroteskMono = localFont({
  src: "../assets/fonts/PPRightGroteskMono-Variable.ttf",
  variable: "--font-rg-mono",
})
const rightGroteskWide = localFont({
  src: "../assets/fonts/PPRightGrotesk-WideVariable.ttf",
  variable: "--font-rg-wide",
})
const rightGroteskTight = localFont({
  src: "../assets/fonts/PPRightGrotesk-TightVariable.ttf",
  variable: "--font-rg-tight",
})

export const metadata: Metadata = {
  title: "Crafted",
  description: "NFT Marketplace!",
}

export default function RootLayout(props: { children: ReactNode }) {
  const cookie = headers().get("cookie") ?? ""
  return (
    <html lang="en" className="">
      <body
        className={`${rightGroteskCasual.variable} ${rightGroteskMono.variable} ${rightGroteskWide.variable} ${rightGroteskTight.variable} bg-background text-foreground`}
      >
        <Providers cookie={cookie}>
          <Navbar />
          {props.children}
        </Providers>
      </body>
    </html>
  )
}
