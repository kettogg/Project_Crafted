"use client"

import "@rainbow-me/rainbowkit/styles.css"

import { type ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { cookieToInitialState, type State, WagmiProvider } from "wagmi"
import { baseSepolia } from "wagmi/chains"

import { RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { OnchainKitProvider } from "@coinbase/onchainkit"

import { getConfig } from "@/configs/wagmi"

export const Providers = ({
  children,
  cookie,
}: {
  children: ReactNode
  cookie: string
}) => {
  const [config] = useState(() => getConfig())
  const [queryClient] = useState(() => new QueryClient())
  const initialState = cookieToInitialState(config, cookie)
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
        >
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
