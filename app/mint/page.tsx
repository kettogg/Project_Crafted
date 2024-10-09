"use client"

import React, { useState } from "react"

import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi"
import { type BaseError } from "wagmi"

import { parseEther } from "viem"

import { pinFileToIPFS, pinJSONToIPFS } from "@/actions/pinata"

import { ABI, ADDRESS } from "@/contract"

import { cn } from "@/lib/utils"

const Mint = () => {
  const [inputParams, updateInputParams] = useState({
    name: "",
    description: "",
    price: "",
    royalty: "",
  })
  const [fileHash, setFileHash] = useState<string>("")
  const [fileUrl, setFileUrl] = useState<string>("")
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadingJSON, setUploadingJSON] = useState<boolean>(false)

  const { address: accountAddress, status: accountStatus } = useAccount()

  // READ - Get the current market fee
  const { data: marketFee } = useReadContract({
    abi: ABI,
    address: ADDRESS,
    functionName: "getMarketFeePercent",
  })

  // WRITE - Mint NFT
  const {
    data: mintHash,
    error: mintError,
    isPending: mintPending,
    writeContractAsync: mintWriteContractAsync,
  } = useWriteContract()
  const { isLoading: mintConfirming, isSuccess: mintConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash })

  // FUNCTION - Mint NFT
  const mint = async () => {
    if (uploading) {
      alert("File uploading!")
      return
    }
    try {
      const { name, description, price, royalty } = inputParams

      // Make sure that none of the fields are empty
      if (!name || !description || !price || !royalty || !fileHash) {
        console.log("Missing fields!")
        return
      }

      setUploadingJSON(true)

      const pinnedJSON = await pinJSONToIPFS({
        fileIpfsHash: fileHash,
        name: name,
        description: description,
      })
      if (pinnedJSON === undefined) throw new Error("Empty pinnedJSON")

      if (pinnedJSON.success === true) {
        setUploadingJSON(false)

        const { jsonIpfsHash: ipfsHash } = pinnedJSON

        if (!ipfsHash) throw new Error("Missing ipfsHash of the File!")

        const priceInWei = parseEther(price)
        const feePercent = marketFee ? BigInt(marketFee) : BigInt(2)
        const fee = (priceInWei * feePercent) / BigInt(100)

        const mintTx = await mintWriteContractAsync({
          abi: ABI,
          address: ADDRESS,
          functionName: "mintNFT",
          args: [ipfsHash, priceInWei, Number(royalty)],
          value: fee,
        })
        if (mintTx && !mintPending) {
          console.log("mintTx Success")
          return
        }
      } else {
        throw new Error("Success message from pinJSONToIPFS is NOT true!")
      }
    } catch (e) {
      setUploadingJSON(false)
      console.log("Error while minting: ", e)
    }
  }

  const handleOnChangeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]

    try {
      // Upload the file to IPFS
      setUploading(true)
      if (file) {
        const pinnedFile = await pinFileToIPFS({ file })
        if (pinnedFile === undefined) throw new Error("Empty pinnedFile")
        if (pinnedFile.success === true) {
          pinnedFile.fileIpfsHash && setFileHash(pinnedFile.fileIpfsHash)
          pinnedFile.fileUrl && setFileUrl(pinnedFile.fileUrl)
        }
      }
      setUploading(false)
    } catch (e) {
      console.log("Error during file upload", e)
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
      <h1 className="text-3xl font-bold">Create New NFT</h1>
      <div className="flex flex-col">
        <div>
          <input
            disabled={
              uploading ||
              uploadingJSON ||
              mintPending ||
              mintConfirming ||
              mintConfirmed
            }
            type="file"
            onChange={handleOnChangeFile}
          />
          {uploading ? "Uploading ...." : "Uploaded/Nothing to Upload"}
        </div>
        <div>
          Name
          <input
            id="nftName"
            type="text"
            onChange={(e) =>
              updateInputParams({ ...inputParams, name: e.target.value })
            }
          />
        </div>
        <div>
          Description
          <textarea
            id="nftDescription"
            onChange={(e) =>
              updateInputParams({ ...inputParams, description: e.target.value })
            }
          ></textarea>
        </div>
        <div>
          Price
          <input
            id="nftPrice"
            type="text"
            onChange={(e) =>
              updateInputParams({ ...inputParams, price: e.target.value })
            }
          />
        </div>
        <div>
          Royalty
          <input
            id="nftRoyalty"
            type="number"
            onChange={(e) =>
              updateInputParams({ ...inputParams, royalty: e.target.value })
            }
          />
        </div>
        {fileUrl && <img className="w-20" src={fileUrl} alt="" />}
        <div>
          <button
            disabled={
              !inputParams.name ||
              !inputParams.description ||
              !inputParams.price ||
              !inputParams.royalty ||
              !fileHash ||
              uploadingJSON ||
              mintPending ||
              mintConfirming ||
              mintConfirmed
            }
            type="submit"
            className={cn(
              `bg-slate-400`,
              `${(!inputParams.name || !inputParams.description || !inputParams.price || !inputParams.royalty || !fileHash) && "bg-red-500"}`,
              `${(uploadingJSON || mintPending) && "bg-blue-300"}`,
              `${mintConfirming && "bg-gray-600"}`,
              `${mintConfirmed && "bg-green-400"}`
            )}
            onClick={mint}
          >
            {uploadingJSON
              ? "Uploading metadata"
              : mintPending
                ? "Tx pending..."
                : mintConfirming
                  ? "Confirming Tx ..."
                  : mintConfirmed
                    ? "Minting Confirmed!"
                    : "Mint NFT!"}
          </button>
        </div>
        {mintHash && <div>Transaction Hash: {mintHash}</div>}
        {mintConfirming && <div>Waiting for confirmation...</div>}
        {mintConfirmed && <div>Transaction confirmed.</div>}
        {mintError && (
          <div>
            Error: {(mintError as BaseError).shortMessage || mintError.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default Mint
