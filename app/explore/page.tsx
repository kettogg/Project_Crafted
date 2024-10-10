"use client"

import Link from "next/link"

import React, { useState, useEffect } from "react"

import { useAccount, useReadContract } from "wagmi"

import { ABI, ADDRESS } from "@/contract"

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
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold">Explore</h1>
      <div className="flex gap-2 w-40">
        {otherListedNFTs.map((nft) => (
          <div>
            <NFTCard key={nft.tokenId} nft={nft} />
            <button className="bg-slate-500">
              <Link href={`/assets/ethereum/${nft.tokenId}`}>Buy this NFT</Link>
            </button>
          </div>
        ))}
      </div>

      {userListedNFTs.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold">NFTs Listed by You</h2>
          <h3 className="text-xl font-medium">
            Please go to the profile page to change this
          </h3>
          <div className="flex w-40 gap-2">
            {userListedNFTs.map((nft) => (
              <NFTCard key={nft.tokenId} nft={nft} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Explore
