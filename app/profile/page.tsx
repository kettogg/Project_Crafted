"use client"

import React, { useState, useEffect, useRef } from "react"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"

import { parseEther } from "viem"

import { ABI, ADDRESS } from "@/contract"

import NFTCard from "@/components/nftcard"
import ListDialog from "@/components/listdialog"
import UnlistDialog from "@/components/unlistdialog"

import { MarketItem } from "@/lib/types"

const Profile = () => {
  const [tokenCount, setTokenCount] = useState<bigint | null>(null)
  const [marketFee, setMarketFee] = useState<number | null>(null)

  const [ownedNFTs, setOwnedNFTs] = useState<MarketItem[]>()
  const [listedNFTs, setListedNFTs] = useState<MarketItem[]>([])
  const [unlistedNFTs, setUnlistedNFTs] = useState<MarketItem[]>([])

  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(null)
  const [selectedListingPrice, setSelectedListingPrice] = useState<string>("")

  const listDialogRef = useRef<HTMLDialogElement | null>(null)
  const unlistDialogRef = useRef<HTMLDialogElement | null>(null)

  const {
    address: accountAddress,
    chainId,
    status: accountStatus,
  } = useAccount()

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

  // WRITE - For listing the NFT
  const {
    data: listHash,
    error: listError,
    isPending: listPending,
    writeContractAsync: listWriteContractAsync,
  } = useWriteContract()
  const { isLoading: listConfirming, isSuccess: listConfirmed } =
    useWaitForTransactionReceipt({ hash: listHash })

  // WRITE - For unlisting the NFT
  const {
    data: unlistHash,
    error: unlistError,
    isPending: unlistPending,
    writeContractAsync: unlistWriteContractAsync,
  } = useWriteContract()
  const { isLoading: unlistConfirming, isSuccess: unlistConfirmed } =
    useWaitForTransactionReceipt({ hash: unlistHash })

  // READ - Get all owned NFTs
  const {
    data: ownedNFTsData,
    status: ownedNFTsDataStatus,
    refetch: refetchOwnedNFTs,
  } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    account: accountAddress,
    functionName: "getNFTsOwnedByUser",
    args: [],
    query: { enabled: true },
  })
  useEffect(() => {
    if (ownedNFTsData) {
      // console.log(ownedNFTsDataStatus, ownedNFTsData)
      setOwnedNFTs(ownedNFTsData as MarketItem[])

      // Separate the NFTs as listed and unlisted
      const listedNFTs = ownedNFTsData.filter(
        (nft: MarketItem) => nft.isListed === true
      )
      const unlistedNFTs = ownedNFTsData.filter(
        (nft: MarketItem) => nft.isListed === false
      )

      setListedNFTs(listedNFTs)
      setUnlistedNFTs(unlistedNFTs)
    }
  }, [ownedNFTsData])

  // EFFECT -  Refetch the ownedNFTsData on confirmation of listing/unlisting of NFT
  useEffect(() => {
    if (listConfirmed || unlistConfirmed) {
      refetchOwnedNFTs() // Trigger refetch when either listConfirmed or unlistConfirmed is true
    }
  }, [listConfirmed, unlistConfirmed])

  // OPEN List Dialog
  const openListDialog = (tokenId: bigint) => {
    setSelectedTokenId(tokenId)

    if (listDialogRef.current) listDialogRef.current.showModal()
  }

  // OPEN Unlist Dialog
  const openUnlistDialog = (tokenId: bigint) => {
    setSelectedTokenId(tokenId)

    if (unlistDialogRef.current) unlistDialogRef.current.showModal()
  }

  // CLOSE List/Unlist Dialog
  const closeDialog = () => {
    setSelectedTokenId(null)
    setSelectedListingPrice("")
    if (listDialogRef.current) listDialogRef.current.close()
    if (unlistDialogRef.current) unlistDialogRef.current.close()
  }

  // FUNCTION - List NFT
  const listNFT = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedTokenId) return
    try {
      e.preventDefault()
      const listPriceWei = parseEther(selectedListingPrice)
      const listTx = await listWriteContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "listNFT",
        args: [selectedTokenId, listPriceWei],
      })
      if (listTx && !listPending) {
        console.log("listTx Success")
      }
    } catch (e) {
      console.log("Error - listNFT: ", e)
    }
  }

  // FUNCTION - Unlist NFT
  const unlistNFT = async () => {
    if (!selectedTokenId) return
    try {
      const unlistTx = await unlistWriteContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "unlistNFT",
        args: [selectedTokenId],
      })
      if (unlistTx && !unlistPending) {
        console.log("unlistTx Success")
      }
    } catch (e) {
      console.log("Error - unlistNFT: ", e)
    }
  }

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
      <h2 className="text-xl font-semibold">Owned NFTs</h2>
      <h1 className="text-2xl font-medium">Unlisted NFTs</h1>
      <div className="flex gap-2 ">
        {unlistedNFTs?.map((nft) => {
          return (
            <div>
              <NFTCard key={nft.tokenId} nft={nft} />
              <button
                onClick={() => openListDialog(nft.tokenId)}
                className="bg-green-400"
              >
                List this NFT
              </button>
            </div>
          )
        })}
      </div>
      {/* List Dialog */}
      <ListDialog
        dialogRef={listDialogRef}
        listingPrice={selectedListingPrice}
        setListingPrice={setSelectedListingPrice}
        listNFT={listNFT}
        listPending={listPending}
        listConfirming={listConfirming}
        listConfirmed={listConfirmed}
        listHash={listHash}
        listError={listError}
        closeDialog={closeDialog}
      />
      <h1 className="text-2xl font-medium">Listed NFTs</h1>
      <div className="flex gap-2 ">
        {listedNFTs?.map((nft) => {
          return (
            <div>
              <NFTCard key={nft.tokenId} nft={nft} />
              <button
                onClick={() => openUnlistDialog(nft.tokenId)}
                className="bg-yellow-300"
              >
                Unlist this NFT
              </button>
            </div>
          )
        })}
      </div>
      <UnlistDialog
        dialogRef={unlistDialogRef}
        unlistNFT={unlistNFT}
        unlistPending={unlistPending}
        unlistConfirming={unlistConfirming}
        unlistConfirmed={unlistConfirmed}
        unlistHash={unlistHash}
        unlistError={unlistError}
        closeDialog={closeDialog}
      />
    </div>
  )
}

export default Profile
