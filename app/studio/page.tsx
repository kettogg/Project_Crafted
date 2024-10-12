"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { base, baseSepolia } from "wagmi/chains"

import { parseEther } from "viem"

import {
  Identity,
  Avatar,
  Name,
  Address,
  EthBalance,
  Badge,
} from "@coinbase/onchainkit/identity"

import { ABI, ADDRESS } from "@/contract"

import WalletWrapper from "@/components/wallet"
import NFTCard from "@/components/nftcard"
import ListDialog from "@/components/listdialog"
import UnlistDialog from "@/components/unlistdialog"
import { Skeleton } from "@/components/skeleton"

import { MarketItem } from "@/lib/types"

const Accout = () => {
  const {
    address: accountAddress,
    chainId,
    status: accountStatus,
  } = useAccount()

  if (accountStatus === "disconnected") {
    return (
      <div className="w-full flex flex-col gap-4 items-center justify-center pt-60 px-10 font-mono">
        <h1 className="text-base tracking-tighter text-foreground-muted font-light text-center">
          {`Please connect your wallet to access your profile :)`}
        </h1>
        <WalletWrapper
          className="rounded-radii-sm px-[0.85rem] py-[0.4rem] transition-colors duration-200"
          text="Connect Wallet"
          withWalletAggregator={true}
        />
      </div>
    )
  }

  if (accountStatus === "connecting") {
    return (
      <div className="w-full flex flex-col gap-4 items-center justify-center pt-60 px-10 font-mono">
        <h1 className="text-base tracking-tighter text-foreground-muted font-light text-center">
          {`Connecting...`}
        </h1>
      </div>
    )
  }

  return <div>Accout</div>
}

export default Accout
