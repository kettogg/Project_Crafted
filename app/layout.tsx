import "@coinbase/onchainkit/styles.css"
import "@/styles/globals.css"

import type { Metadata } from "next"
// import { Space_Mono, Space_Grotesk } from "next/font/google"
import localFont from "next/font/local"
import { headers } from "next/headers"

import { type ReactNode } from "react"

import { Providers } from "@/components/providers"
import Navbar from "@/components/navbar"

const rightGroteskCasualText = localFont({
  src: "../assets/fonts/PPRightGroteskText-CasualVariable.ttf",
  variable: "--font-rg-casual-text",
})
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
const neueMontreal = localFont({
  src: "../assets/fonts/PPNeueMontreal-Variable.ttf",
  variable: "--font-neue",
})
const clashGrotesk = localFont({
  src: "../assets/fonts/ClashGrotesk-Variable.ttf",
  variable: "--font-clash-grotesk",
})
const jetBrainsMono = localFont({
  src: "../assets/fonts/JetBrainsMono-Variable.ttf",
  variable: "--font-jetbrains-mono",
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
        className={`${rightGroteskCasualText.variable} ${rightGroteskCasual.variable} ${rightGroteskMono.variable} ${rightGroteskWide.variable} ${rightGroteskTight.variable} ${neueMontreal.variable} ${clashGrotesk.variable} ${jetBrainsMono.variable} min-w-48 bg-background text-foreground`}
      >
        <Providers cookie={cookie}>
          <Navbar />
          {props.children}
        </Providers>
      </body>
    </html>
  )
}
