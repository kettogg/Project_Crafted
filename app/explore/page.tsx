"use client"

import Link from "next/link"

import React, { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"

import { ABI, ADDRESS } from "@/contract"

import Gallery from "@/components/gallery"
import NFTCard from "@/components/nftcard"

import { MarketItem } from "@/lib/types"

const Explore = () => {
  const [listedNFTs, setListedNFTs] = useState<MarketItem[]>()
  const [userListedNFTs, setUserListedNFTs] = useState<MarketItem[]>([])
  const [otherListedNFTs, setOtherListedNFTs] = useState<MarketItem[]>([])

  const { address: accountAddress } = useAccount()

  // READ - Get all owned NFTs
  const { data: listedNFTsData, status: listedNFTsDataStatus } =
    useReadContract({
      abi: ABI,
      address: ADDRESS,
      account: accountAddress,
      functionName: "getAllListedNFTs",
      args: [],
    })
  useEffect(() => {
    if (listedNFTsData) {
      // console.log(listedNFTsDataStatus, listedNFTsData)
      setListedNFTs(listedNFTsData as MarketItem[])

      // Separate the NFTs listed by the current user and others
      const userNFTs = listedNFTsData.filter(
        (nft: MarketItem) => nft.currentOwner === accountAddress
      )
      const otherNFTs = listedNFTsData.filter(
        (nft: MarketItem) => nft.currentOwner !== accountAddress
      )

      setUserListedNFTs(userNFTs)
      setOtherListedNFTs(otherNFTs)
    }
  }, [listedNFTsData, accountAddress])

  return (
    <div className="relative flex flex-col w-full mx-auto px-4 py-32 scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:px-4 scr-1560:px-4">
      <section className="flex flex-col justify-center font-sans text-base gap-4">
        <h1 className="text-[2rem] font-semibold tracking-tight pb-6 border-b border-white/5">
          Explore
        </h1>

        <div className="flex items-center text-base font-medium text-foreground-muted-dark">
          Discover and buy NFTs created or listed by others.
        </div>

        <div className="flex flex-col w-full">
          <Gallery itemsList={otherListedNFTs} />
        </div>

        {userListedNFTs.length > 0 && (
          <div className="flex flex-col gap-4 mt-12">
            <h1 className="text-[2rem] font-semibold tracking-tight pb-6 border-b border-white/5">
              Your listed NFTs
            </h1>
            <div className="flex items-center text-base font-medium text-foreground-muted-dark">
              <div>
                Please go to the profile page to unlist or manage your NFTs -
              </div>

              <Link
                href="/account"
                className="flex items-center text-foreground ml-2 fill-none stroke-foreground hover:text-blue hover:stroke-blue"
              >
                <span>Profile</span>
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="mb-[0.5px]"
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </Link>
            </div>
            <div className="flex flex-col w-full">
              <Gallery itemsList={userListedNFTs} />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default Explore
