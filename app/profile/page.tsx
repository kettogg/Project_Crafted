"use client"

import React, { useState, useEffect } from "react"

import { useAccount, useReadContract, useWriteContract } from "wagmi"

import { getConfig } from "@/configs/wagmi"

import { ABI, ADDRESS } from "@/contract"

import NFTCard from "@/components/nftcard"

import { MarketItem } from "@/lib/types"

const Profile = () => {
  const [tokenCount, setTokenCount] = useState<bigint | null>(null)
  const [marketFee, setMarketFee] = useState<number | null>(null)
  const [ownedNFTs, setOwnedNFTs] = useState<MarketItem[]>()

  const {
    address: accountAddress,
    chainId,
    status: accountStatus,
  } = useAccount()

  const { writeContract } = useWriteContract()

  // READ - Number of tokens minted
  const { data: tokenCountData, status: tokenCountStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "tokenCount",
    args: [],
  })
  useEffect(() => {
    if (tokenCountData) {
      // console.log(tokenCountData)
      setTokenCount(tokenCountData)
    }
  }, [tokenCountData])

  // READ - Market fee
  const { data: marketFeeData, status: marketFeeStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "getMarketFeePercent",
    args: [],
  })
  useEffect(() => {
    if (marketFeeData) {
      // console.log(marketFeeData)
      setMarketFee(marketFeeData)
    }
  }, [marketFeeData])

  // READ - Get all owned NFTs
  const { data: ownedNFTsData, status: ownedNFTsDataStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "getNFTsOwnedByUser",
    args: [],
  })
  useEffect(() => {
    if (ownedNFTsData) {
      // console.log(ownedNFTsDataStatus, ownedNFTsData)
      setOwnedNFTs(ownedNFTsData as MarketItem[])
    }
  }, [ownedNFTsData])

  if (accountStatus === "disconnected") {
    return <div>Please connect your wallet</div>
  }

  if (accountStatus === "connecting") {
    return <div>Connecting ...</div>
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Profile Page</h1>
      <div>Account address: {accountAddress} </div>
      Status: {accountStatus}
      <br />
      Chain Id: {chainId}
      <h2 className="text-lg font-semibold">Contract and Marketplace info</h2>
      <div>
        Contract Address: {ADDRESS}
        <br />
        Token Count:{" "}
        {tokenCountStatus === "pending" ? "..." : tokenCount?.toString()}
        <br />
        Market Fee Percent:{" "}
        {marketFeeStatus === "pending" ? "... %" : marketFee?.toString()}
      </div>
      <h2 className="text-lg font-semibold">Owned NFTs</h2>
      <div className="flex gap-2 ">
        {ownedNFTs?.map((nft) => {
          return (
            <NFTCard key={nft.tokenId} nft={nft} userAddress={accountAddress} />
          )
        })}
      </div>
    </div>
  )
}

export default Profile
