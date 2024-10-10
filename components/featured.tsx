"use client"

import React, { useState, useEffect } from "react"

import { motion } from "framer-motion"

import { useReadContract } from "wagmi"
import { base } from "wagmi/chains"

import { Avatar } from "@coinbase/onchainkit/identity"

import { ABI, ADDRESS } from "@/contract"

import { MarketItem } from "@/lib/types"

const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string

type FeaturedCardProps = {
  tokenId: bigint
  boxShadow?: string
  className?: string
  isSelected: boolean
  isHovered: boolean
  isOtherHovered: boolean
  onClick: (fileUrl: string, tokenId: bigint) => void
}

const FeaturedCard = ({
  tokenId,
  boxShadow,
  className,
  isSelected,
  isHovered,
  isOtherHovered,
  onClick,
}: FeaturedCardProps) => {
  const [nftName, setNftName] = useState<string>("")
  const [nftItem, setNftItem] = useState<MarketItem>()
  const [fileURL, setFileURL] = useState<string>("")

  const [isEnabled, setIsEnabled] = useState(false)

  // Use local storage if all availabe for faster loading
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure this only runs on the client side
      const storedNftItem = localStorage.getItem(`FeaturedNFTItem#${tokenId}`)
      const storedName = localStorage.getItem(`FeaturedNFTItem#${tokenId}#Name`)
      const storedFileURL = localStorage.getItem(
        `FeaturedNFTItem#${tokenId}#FileURL`
      )
      if (storedNftItem && storedName && storedFileURL) {
        const parsedNftItem: MarketItem = JSON.parse(storedNftItem)
        const nftItem: MarketItem = {
          ...parsedNftItem,
          tokenId: BigInt(parsedNftItem.tokenId),
          price: BigInt(parsedNftItem.price),
        }
        setNftItem(nftItem)
        setNftName(storedName)
        setFileURL(storedFileURL)
      } else {
        setIsEnabled(true) // Enable the query if item doesn't exist in localStorage
      }
    }
  }, [tokenId])

  // READ - Get token URI and use it to get the file URL (image/gif/audio)
  const { data: tokenURIData, status: tokenURIStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
    query: { enabled: isEnabled },
  })
  useEffect(() => {
    const getFileURL = async () => {
      if (isEnabled && tokenURIData) {
        try {
          const jsonURL = `https://${gatewayURL}/ipfs/${tokenURIData}`

          const res = await fetch(jsonURL)
          const jsonMetaData = await res.json()
          // Get the name of NFT
          if (jsonMetaData.name) {
            const name = jsonMetaData.name
            setNftName(name)
            localStorage.setItem(`FeaturedNFTItem#${tokenId}#Name`, name)
          }
          // Check and update the fileURL if imgUrl exists and starts with ipfs://
          if (jsonMetaData.image && jsonMetaData.image.startsWith("ipfs://")) {
            const ipfsHash = jsonMetaData.image.split("ipfs://")[1]
            const pubURL = `https://${gatewayURL}/ipfs/${ipfsHash}`
            // Set the file URL state
            setFileURL(pubURL)
            localStorage.setItem(`FeaturedNFTItem#${tokenId}#FileURL`, pubURL)
            // console.log("File URI:", pubURL)
          }
        } catch (error) {
          console.error("Error fetching file URI: ", error)
        }
      }
    }

    getFileURL()
  }, [tokenURIData])

  // READ - Get the NFT Data
  const { data: nftItemData, status: nftItemStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "tokenIdToMarketItem",
    args: [tokenId],
    query: { enabled: isEnabled },
  })
  useEffect(() => {
    const getNftData = async () => {
      if (isEnabled && nftItemData) {
        console.log(nftItemData)
        const nftItem: MarketItem = {
          tokenId: nftItemData[0],
          creator: nftItemData[1],
          currentOwner: nftItemData[2],
          price: nftItemData[3],
          royaltyFeePercent: nftItemData[4],
          isListed: nftItemData[5],
        }
        setNftItem(nftItem)
        const nftItemForStorage = {
          ...nftItem,
          // JSON.stringify cannot handle BigInt values, which are not supported in JSON
          tokenId: nftItem.tokenId.toString(),
          price: nftItem.price.toString(),
        }

        localStorage.setItem(
          `FeaturedNFTItem#${tokenId}`,
          JSON.stringify(nftItemForStorage)
        )
      }
    }
    getNftData()
  }, [nftItemData])

  return (
    <div onClick={() => onClick(fileURL, tokenId)}>
      {tokenId.toString()} {nftName} {nftItem?.creator}
      <motion.img
        animate={{
          scale:
            isHovered || (!isHovered && !isOtherHovered && isSelected)
              ? 1.1
              : isSelected && isOtherHovered
                ? 1
                : 1,
          transition: { duration: 0.3 },
        }}
        className="w-20"
        src={fileURL}
        alt=""
      />
      {nftItem && <Avatar address={nftItem.creator} chain={base} />}
    </div>
  )
}

export default FeaturedCard
