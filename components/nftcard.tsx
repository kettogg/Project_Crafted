"use client"

import React, { useState, useEffect } from "react"

import { useReadContract } from "wagmi"

import { formatEther } from "viem"

import { ABI, ADDRESS } from "@/contract"

import { MarketItem } from "@/lib/types"

type NFTCardProps = {
  nft: MarketItem
}

const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string

const NFTCard = ({
  nft: {
    tokenId,
    creator,
    currentOwner,
    price,
    royaltyFeePercent,
    isListed: initialIsListed,
  },
}: NFTCardProps) => {
  const [fileURL, setFileURL] = useState<string>("")

  const [isListed, setIsListed] = useState<boolean>(initialIsListed)

  // READ - Get token URI and use it to get the file URL (image/gif/audio)
  const { data: tokenURIData, status: tokenURIStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  })
  useEffect(() => {
    const getFileURL = async () => {
      if (tokenURIData) {
        try {
          const jsonURL = `https://${gatewayURL}/ipfs/${tokenURIData}`

          const res = await fetch(jsonURL)
          const jsonMetaData = await res.json()

          // Check and update the fileURL if imgUrl exists and starts with ipfs://
          if (jsonMetaData.image && jsonMetaData.image.startsWith("ipfs://")) {
            const ipfsHash = jsonMetaData.image.split("ipfs://")[1]
            const pubURL = `https://${gatewayURL}/ipfs/${ipfsHash}`

            // Set the file URL state
            setFileURL(pubURL)
            // console.log("Updated File URI:", pubURL)
          } else {
            console.log("imgUrl not found or does not start with ipfs://")
          }
        } catch (error) {
          console.error("Error fetching file URI:", error)
        }
      }
    }

    getFileURL()
  }, [tokenURIData, tokenURIStatus])

  return (
    <div className="w-48 break-words gap-28">
      Token ID: {tokenId.toString()}
      <br />
      Creator: {creator}
      <br />
      Owner: {currentOwner}
      <br />
      Royalty: {royaltyFeePercent}
      <br />
      {isListed && <div>Listing Price - {formatEther(price)}</div>}
      <img src={fileURL} alt="" />
    </div>
  )
}

export default NFTCard
