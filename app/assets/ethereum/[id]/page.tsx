"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

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
import { div } from "framer-motion/client"

const gatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL as string

type NftItemPageProps = {
  params: {
    id: string
  }
}

const NftItemPage = ({ params }: NftItemPageProps) => {
  const router = useRouter()

  const [isTokenIdValid, setIsTokenIdValid] = useState<boolean>(true)
  const [tokenCount, setTokenCount] = useState<bigint | null>(null)

  const [nftItem, setNftItem] = useState<MarketItem>()

  const [fileURL, setFileURL] = useState<string>("")
  const [nftName, setNftName] = useState<string>("")
  const [nftDesc, setNftDesc] = useState<string>("")

  const { address: accountAddress } = useAccount()

  const tokenId: bigint = (() => {
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

          if (jsonMetaData.name) {
            const nftName = jsonMetaData.name
            setNftName(nftName)
          }

          if (jsonMetaData.description) {
            const nftDesc = jsonMetaData.description
            setNftDesc(nftDesc)
          }
        } catch (error) {
          console.error("Error fetching file URI:", error)
        }
      }
    }

    getFileURL()
  }, [tokenURIData, tokenURIStatus])

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

  const redirectToAccountPage = () => {
    router.push(`/account`)
  }

  // Used to normalize the addresses :)
  function shrinkAddress(address: string): string {
    // Ensure the input is a valid Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      throw new Error("Invalid Ethereum address")
    }

    const start = address.slice(0, 6) // First 4 characters after '0x'
    const end = address.slice(-4) // Last 4 characters

    // Return the contracted form
    return `${start}...${end}`
  }

  return (
    <div className="relative flex flex-col w-full mx-auto px-4 pt-[4.5rem] scr-1360:max-w-[1360px] scr-1360:mx-auto scr-1360:px-4 scr-1560:px-4 font-sans">
      {nftItem?.isListed && accountAddress === nftItem.currentOwner && (
        <div className="flex justify-end items-center w-full py-3 border-b border-white/[0.12]">
          <button
            onClick={redirectToAccountPage}
            className="bg-blue text-foreground hover:bg-blue-hover px-6 py-3 rounded-radii-xl font-semibold text-base disabled:cursor-not-allowed"
          >
            Manage listing
          </button>
        </div>
      )}
      <section className="flex mt-4 gap-4">
        <div className="flex flex-col gap-4 grow-[3] min-w-[40%] max-w-[50%] overflow-hidden">
          <article className="flex flex-col w-full rounded-radii-lg border border-white/[0.12] overflow-hidden">
            <header className="bg-elevation flex items-center justify-between p-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 111 111"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z"
                  fill="white"
                />
              </svg>
              <Link
                href={fileURL}
                target="_blank"
                className="flex items-center justify-center text-blue-light fill-blue-light hover:text-blue-hover hover:fill-blue-hover"
              >
                <span className="text-sm font-medium">View source</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 -960 960 960"
                  className="ml-1"
                >
                  <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z" />
                </svg>
              </Link>
            </header>
            <div className="relative w-full aspect-square">
              <Image
                alt={`${nftName}#${nftItem?.tokenId}`}
                src={fileURL}
                fill={true}
                className="object-contain object-center"
              />
            </div>
          </article>
          <div className="flex flex-col w-full rounded-radii-lg bg-white/[0.04] border border-white/[0.12] overflow-hidden">
            <div className="flex items-center p-5 border-b border-white/[0.12]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
                className="mr-2"
              >
                <path d="M160-200v-80h400v80H160Zm0-160v-80h640v80H160Zm0-160v-80h640v80H160Zm0-160v-80h640v80H160Z" />
              </svg>
              <h4 className="text-base font-semibold text-foreground">
                Description
              </h4>
            </div>
            <div className="p-6 border-b border-white/[0.12]"> {nftDesc}</div>
            <div className="flex items-center p-5 border-b border-white/[0.12]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#fff"
                className="mr-2"
              >
                <path d="M480-560h200v-80H480v80Zm0 240h200v-80H480v80ZM360-520q33 0 56.5-23.5T440-600q0-33-23.5-56.5T360-680q-33 0-56.5 23.5T280-600q0 33 23.5 56.5T360-520Zm0 240q33 0 56.5-23.5T440-360q0-33-23.5-56.5T360-440q-33 0-56.5 23.5T280-360q0 33 23.5 56.5T360-280ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
              </svg>
              <h4 className="text-base font-semibold text-foreground">
                Details
              </h4>
            </div>
            <div className="flex flex-col p-5 gap-2">
              <div className="flex justify-between">
                <span>Conract address</span>
                <Link
                  href={`https://sepolia.basescan.org/address/${ADDRESS}`}
                  target="_blank"
                  className="text-blue-light hover:text-blue-hover"
                >
                  {shrinkAddress(ADDRESS)}
                </Link>
              </div>
              <div className="flex justify-between">
                <span>Token ID</span>
                <Link
                  href={`https://sepolia.basescan.org/address/${ADDRESS}/?a=${tokenId}`}
                  target="_blank"
                  className="text-blue-light hover:text-blue-hover"
                >
                  {tokenId.toString()}
                </Link>
              </div>
              <div className="flex justify-between">
                <span>Token Standard</span>
                <span>ERC-721</span>
              </div>
              <div className="flex justify-between">
                <span>Chain</span>
                <span>Base Sepolia</span>
              </div>
              <div className="flex justify-between">
                <span>Creator Earnings</span>
                <span>{nftItem?.royaltyFeePercent.toString()}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grow-[4]"></div>
      </section>
    </div>
    // <div className="pt-40">
    //   <h1 className="text-3xl font-semibold">NFT Item page</h1>
    //   {!isTokenIdValid ? (
    //     <div className="text-red-500">Invalid token</div>
    //   ) : nftItem ? (
    //     <div>
    //       {/* <NFTCard nft={nftItem} /> */}
    //       {nftItem.currentOwner === accountAddress ? (
    //         "You own this NFT!"
    //       ) : (
    //         <div>
    //           <button
    //             onClick={() => buyNFT(nftItem.tokenId, nftItem.price)}
    //             disabled={buyPending || buyConfirming || buyConfirmed}
    //             className={cn(
    //               `bg-slate-400`,
    //               `${buyPending && "bg-blue-300"}`,
    //               `${buyConfirming && "bg-gray-600"}`,
    //               `${buyConfirmed && "bg-green-400"}`
    //             )}
    //           >
    //             {buyPending
    //               ? "Tx pending..."
    //               : buyConfirming
    //                 ? "Confirming Tx ..."
    //                 : buyConfirmed
    //                   ? "Bought the NFT!!"
    //                   : "Buy this NFT"}
    //           </button>
    //           {buyHash && <div>Transaction Hash: {buyHash}</div>}
    //           {buyConfirming && <div>Waiting for confirmation...</div>}
    //           {buyConfirmed && <div>Transaction confirmed.</div>}
    //           {buyError && (
    //             <div>
    //               Error:{" "}
    //               {(buyError as BaseError).shortMessage || buyError.message}
    //             </div>
    //           )}
    //         </div>
    //       )}
    //     </div>
    //   ) : (
    //     <div>Loading NFT ...</div>
    //   )}
    // </div>
  )
}

export default NftItemPage
