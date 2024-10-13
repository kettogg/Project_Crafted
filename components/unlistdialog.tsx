import React from "react"

import { type BaseError } from "wagmi"

import { cn } from "@/lib/utils"

import { NFTMetadata } from "@/lib/types"

type UnlistDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement>
  unlistNFT: () => Promise<void>
  unlistPending: boolean
  unlistConfirming: boolean
  unlistConfirmed: boolean
  unlistHash: string | undefined
  unlistError: any
  closeDialog: () => void
}

const UnlistDialog = ({
  dialogRef,
  unlistNFT,
  unlistPending,
  unlistConfirming,
  unlistConfirmed,
  unlistHash,
  unlistError,
  closeDialog,
}: UnlistDialogProps) => {
  return (
    <dialog ref={dialogRef} className="z-10 bg-purple-400">
      <h2>UnList the NFT</h2>
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
        <button className="bg-slate-400" onClick={closeDialog}>
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
  )
}

export default UnlistDialog
