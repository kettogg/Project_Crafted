"use client"

import React, { useState, useEffect, useRef } from "react"

import {
  type BaseError,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"

import { parseEther, formatEther } from "viem"

import { ABI, ADDRESS } from "@/contract"

import { MarketItem, Address } from "@/lib/types"

import { cn } from "@/lib/utils"

type NFTCardProps = {
  nft: MarketItem
  userAddress: Address | undefined
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
  userAddress,
}: NFTCardProps) => {
  const [fileURL, setFileURL] = useState<string>("")

  const [isListed, setIsListed] = useState<boolean>(initialIsListed)
  const [listingPrice, setListingPrice] = useState<string>("")

  const listDialogRef = useRef<HTMLDialogElement | null>(null)
  const unlistDialogRef = useRef<HTMLDialogElement | null>(null)

  // For listing the NFT
  const {
    data: listHash,
    error: listError,
    isPending: listPending,
    writeContractAsync: listWriteContractAsync,
  } = useWriteContract()
  const { isLoading: listConfirming, isSuccess: listConfirmed } =
    useWaitForTransactionReceipt({ hash: listHash })

  // For unlisting the NFT
  const {
    data: unlistHash,
    error: unlistError,
    isPending: unlistPending,
    writeContractAsync: unlistWriteContractAsync,
  } = useWriteContract()
  const { isLoading: unlistConfirming, isSuccess: unlistConfirmed } =
    useWaitForTransactionReceipt({ hash: unlistHash })

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
          if (
            jsonMetaData.imgUrl &&
            jsonMetaData.imgUrl.startsWith("ipfs://")
          ) {
            const ipfsHash = jsonMetaData.imgUrl.split("ipfs://")[1]
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

  // WRITE - List the owned NFT
  const listNFT = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      const listPrice = formData.get("listingPrice") as string
      const listPriceWei = parseEther(listPrice)
      const listTx = await listWriteContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "listNFT",
        args: [tokenId, listPriceWei],
      })
      if (listTx && !listPending) {
        setIsListed(true)
      }
    } catch (e) {
      console.log("Error - listNFT: ", e)
    }
  }

  // WRITE - Unlist the owned NFT
  const unlistNFT = async () => {
    try {
      const unlistTx = await unlistWriteContractAsync({
        address: ADDRESS,
        abi: ABI,
        functionName: "unlistNFT",
        args: [tokenId],
      })
      if (unlistTx && !unlistPending) {
        setIsListed(false)
      }
    } catch (e) {
      console.log("Error - unlistNFT: ", e)
    }
  }

  const openListDialog = () => {
    if (listDialogRef.current) listDialogRef.current.showModal()
  }

  const closeListDialog = () => {
    if (listDialogRef.current) listDialogRef.current.close()
  }

  const openUnlistDialog = () => {
    if (unlistDialogRef.current) unlistDialogRef.current.showModal()
  }

  const closeUnlistDialog = () => {
    if (unlistDialogRef.current) unlistDialogRef.current.close()
  }

  const handleListPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListingPrice(e.target.value)
  }

  // Check if the current connected user is the owner of NFT
  const isOwner = userAddress ? userAddress == currentOwner : false

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
      {/* {isListed && !isOwner && (
        <button className="bg-slate-400">Buy this NFT</button>
      )} */}
      {isListed && isOwner && (
        <div>
          <button onClick={openUnlistDialog} className="bg-slate-400">
            Unlist this NFT
          </button>
        </div>
      )}
      <dialog ref={unlistDialogRef} className="z-10 bg-purple-400">
        <h2>UNList the NFT</h2>
        <p>
          This will unlist the NFT from the marketplace and other users will not
          be able to buy it.
        </p>
        {unlistHash && <div>Transaction Hash: {unlistHash}</div>}
        {unlistConfirming && <div>Waiting for confirmation...</div>}
        {unlistConfirmed && <div>Transaction confirmed.</div>}
        {unlistError && (
          <div>
            Error:{" "}
            {(unlistError as BaseError).shortMessage || unlistError.message}
          </div>
        )}
        <div className="flex justify-between">
          <button className="bg-slate-400" onClick={closeUnlistDialog}>
            Close/Cancel
          </button>
          <button
            onClick={unlistNFT}
            disabled={unlistPending || unlistConfirming || unlistConfirmed}
            className={cn(
              `bg-slate-400`,
              `${unlistPending && "bg-blue-300"}`,
              `${unlistConfirming && "bg-gray-600"}`,
              `${unlistConfirmed && "bg-green-400"}`
            )}
          >
            {unlistPending
              ? "Tx pending..."
              : unlistConfirming
                ? "Confirming Tx ..."
                : unlistConfirmed
                  ? "Unlisting Confirmed!"
                  : "Unlist this NFT!"}
          </button>
        </div>
      </dialog>
      {!isListed && (
        <button onClick={openListDialog} className="bg-slate-400">
          List this NFT
        </button>
      )}
      <dialog ref={listDialogRef} className="z-10 bg-purple-400">
        <div>
          <h2>List the NFT</h2>
          <p>
            This will list the NFT on the marketplace so other users can buy it.
          </p>
          <form onSubmit={listNFT}>
            <input
              name="listingPrice"
              type="number"
              value={listingPrice}
              onChange={handleListPriceChange}
              placeholder="Only numbers"
              step="any" // Allow for decimal values
            />

            <button
              disabled={
                !listingPrice || listPending || listConfirming || listConfirmed
              }
              type="submit"
              className={cn(
                `bg-slate-400`,
                `${!listingPrice && "bg-red-300"}`,
                `${listPending && "bg-blue-300"}`,
                `${listConfirming && "bg-gray-600"}`,
                `${listConfirmed && "bg-green-400"}`
              )}
            >
              {listPending
                ? "Tx pending..."
                : listConfirming
                  ? "Confirming Tx ..."
                  : listConfirmed
                    ? "Listing Confirmed!"
                    : "List this NFT!"}
            </button>
          </form>
          {listHash && <div>Transaction Hash: {listHash}</div>}
          {listConfirming && <div>Waiting for confirmation...</div>}
          {listConfirmed && <div>Transaction confirmed.</div>}
          {listError && (
            <div>
              Error:{" "}
              {(listError as BaseError).shortMessage || listError.message}
            </div>
          )}
          <button className="bg-slate-400" onClick={closeListDialog}>
            Close
          </button>
        </div>
      </dialog>
    </div>
  )
}

export default NFTCard
