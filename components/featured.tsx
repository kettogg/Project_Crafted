"use client"

import Image from "next/image"

import React, { useState, useEffect } from "react"

import { motion } from "framer-motion"

import { useReadContract } from "wagmi"
import { base } from "wagmi/chains"

import { Avatar } from "@coinbase/onchainkit/identity"

import { ABI, ADDRESS } from "@/contract"

import { cn } from "@/lib/utils"
import { MarketItem } from "@/lib/types"
import { div, span } from "framer-motion/client"
import { Skeleton } from "./skeleton"

const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string

type FeaturedCardProps = {
  tokenId: bigint
  className?: string
  isSelected: boolean
  isHovered: boolean
  isOtherHovered: boolean
  onClick: (fileUrl: string, tokenId: bigint) => void
  setBackdropImg: (url: string) => void // For first card's background to be passed back to Hero to display initial backdrop
  setSelNftName: (url: string) => void
  setSelNftItem: (item: MarketItem) => void
}

const FeaturedCard = ({
  tokenId,
  className,
  isSelected,
  isHovered,
  isOtherHovered,
  onClick,
  setBackdropImg,
  setSelNftName, // New prop
  setSelNftItem, // New prop
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

  // Set backdrop image, name for hero
  useEffect(() => {
    if (isSelected && fileURL) {
      setBackdropImg(fileURL)
      nftName && setSelNftName(nftName)
      nftItem && setSelNftItem(nftItem)
    }
  }, [
    isSelected,
    nftName,
    nftItem,
    fileURL,
    setBackdropImg,
    setSelNftName,
    setSelNftItem,
  ])

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
    <div
      style={{
        boxShadow: `${fileURL && nftItem && isSelected ? "rgba(144, 144, 144, 0.25) 0px 4px 30px" : "rgba(0, 0, 0, 0.25) 0px 10px 30px"}`,
      }}
      onClick={() => onClick(fileURL, tokenId)}
      className="relative flex flex-col w-full h-full p-3 overflow-hidden z-[2] rounded-[0.2rem]"
    >
      {fileURL ? (
        <>
          <motion.div
            animate={{
              scale:
                isHovered || (!isHovered && !isOtherHovered && isSelected)
                  ? 1.1
                  : isSelected && isOtherHovered
                    ? 1
                    : 1,
              transition: { duration: 0.3 },
            }}
            style={{
              backgroundImage: `url(${fileURL})`,
            }}
            className="absolute top-0 left-0 flex flex-col w-full h-full bg-cover bg-center bg-no-repeat bg-background"
          ></motion.div>
          <div
            style={{
              background:
                "linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.65) 100%)",
            }}
            className="absolute bottom-0 left-0 flex flex-col w-full h-[4.25rem] z-[4]"
          ></div>
        </>
      ) : (
        <Skeleton className="absolute top-0 left-0 flex flex-col w-full h-full" />
      )}

      <div className="relative flex flex-col w-full h-full justify-between z-[6]">
        {nftItem ? (
          <Avatar
            loadingComponent={<Skeleton className="w-10 h-10 rounded-full" />}
            defaultComponent={
              <svg
                data-testid="ock-defaultAvatarSVG"
                role="img"
                aria-label="ock-defaultAvatarSVG"
                width={40}
                height={40}
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-background bg-foreground"
              >
                <path d="M20 40C8.9543 40 0 31.0457 0 20C0 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20C40 31.0457 31.0457 40 20 40ZM25.6641 13.9974C25.6641 10.8692 23.1282 8.33333 20.0001 8.33333C16.8719 8.33333 14.336 10.8692 14.336 13.9974C14.336 17.1256 16.8719 19.6615 20.0001 19.6615C23.1282 19.6615 25.6641 17.1256 25.6641 13.9974ZM11.3453 23.362L9.53476 28.1875C12.2141 30.8475 15.9019 32.493 19.974 32.5H20.026C24.0981 32.493 27.7859 30.8475 30.4653 28.1874L28.6547 23.362C28.0052 21.625 26.3589 20.4771 24.5162 20.4318C24.4557 20.4771 22.462 21.9271 20 21.9271C17.538 21.9271 15.5443 20.4771 15.4839 20.4318C13.6412 20.462 11.9948 21.625 11.3453 23.362Z" />
              </svg>
            }
            style={{
              filter: "drop-shadow(rgba(0, 0, 0, 0.25) 0px 10px 30px)",
            }}
            className="w-10 h-10"
            address={nftItem.creator}
            chain={base}
          />
        ) : (
          <Skeleton className="w-10 h-10 rounded-full" />
        )}
        {nftName ? (
          <span className="text-sm font-mono font-semibold">{nftName}</span>
        ) : (
          <Skeleton className="w-full h-5 rounded-[0.2rem]" />
        )}
      </div>
    </div>
  )
}

export default FeaturedCard
