"use client"

import React, { useState, useEffect } from "react"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { type BaseError } from "wagmi"

import { ABI, ADDRESS } from "@/contract"

import { cn } from "@/lib/utils"

import { MarketItem } from "@/lib/types"
import NFTCard from "@/components/nftcard"

type NftItemPageProps = {
  params: {
    id: string
  }
}

const NftItemPage = ({ params }: NftItemPageProps) => {
  const [isTokenIdValid, setIsTokenIdValid] = useState<boolean>(true)
  const [tokenCount, setTokenCount] = useState<bigint | null>(null)
  const [nftItem, setNftItem] = useState<MarketItem>()

  const { address: accountAddress } = useAccount()

  const tokenId = (() => {
    try {
      return BigInt(params.id)
    } catch {
      return BigInt(-1) // Invalid tokenId
    }
  })()

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

  // Check tokenId validity
  useEffect(() => {
    if (tokenCount !== null && (tokenId <= BigInt(0) || tokenId > tokenCount)) {
      setIsTokenIdValid(false)
    } else {
      setIsTokenIdValid(true)
    }
  }, [tokenId, tokenCount])

  // READ - Get the NFT Data
  const { data: nftItemData, status: nftItemStatus } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "tokenIdToMarketItem",
    args: [tokenId],
    query: {
      enabled:
        isTokenIdValid &&
        tokenCount !== null &&
        tokenId > BigInt(0) &&
        tokenId <= tokenCount,
    },
  })
  useEffect(() => {
    if (nftItemData) {
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
    }
  }, [nftItemData])

  // WRITE - Buy the NFT
  const {
    data: buyHash,
    error: buyError,
    isPending: buyPending,
    writeContractAsync: buyWriteContractAsync,
  } = useWriteContract()
  const { isLoading: buyConfirming, isSuccess: buyConfirmed } =
    useWaitForTransactionReceipt({ hash: buyHash })

  const buyNFT = async (tokenId: bigint, itemPrice: bigint) => {
    try {
      const buyTx = await buyWriteContractAsync({
        abi: ABI,
        address: ADDRESS,
        functionName: "buyNFT",
        args: [tokenId],
        value: itemPrice,
      })
      if (buyTx && !buyPending) {
        console.log("buyTx Success")
        return
      }
    } catch (e) {
      console.log("Error while buying the NFT: ", e)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">NFT Item page</h1>
      {!isTokenIdValid ? (
        <div className="text-red-500">Invalid token</div>
      ) : nftItem ? (
        <div>
          <NFTCard nft={nftItem} />
          {nftItem.currentOwner === accountAddress ? (
            "You own this NFT!"
          ) : (
            <div>
              <button
                onClick={() => buyNFT(nftItem.tokenId, nftItem.price)}
                disabled={buyPending || buyConfirming || buyConfirmed}
                className={cn(
                  `bg-slate-400`,
                  `${buyPending && "bg-blue-300"}`,
                  `${buyConfirming && "bg-gray-600"}`,
                  `${buyConfirmed && "bg-green-400"}`
                )}
              >
                {buyPending
                  ? "Tx pending..."
                  : buyConfirming
                    ? "Confirming Tx ..."
                    : buyConfirmed
                      ? "Bought the NFT!!"
                      : "Buy this NFT"}
              </button>
              {buyHash && <div>Transaction Hash: {buyHash}</div>}
              {buyConfirming && <div>Waiting for confirmation...</div>}
              {buyConfirmed && <div>Transaction confirmed.</div>}
              {buyError && (
                <div>
                  Error:{" "}
                  {(buyError as BaseError).shortMessage || buyError.message}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>Loading NFT ...</div>
      )}
    </div>
  )
}

export default NftItemPage
