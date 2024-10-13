import React from "react"

import { type BaseError } from "wagmi"

import { cn } from "@/lib/utils"

import { NFTMetadata } from "@/lib/types"

type ListDialogProps = {
  dialogRef: React.RefObject<HTMLDialogElement>
  listingPrice: string
  setListingPrice: (price: string) => void
  listNFT: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  listPending: boolean
  listConfirming: boolean
  listConfirmed: boolean
  listHash: string | undefined
  listError: any
  closeDialog: () => void
}

const ListDialog = ({
  dialogRef,
  listingPrice,
  setListingPrice,
  listNFT,
  listPending,
  listConfirming,
  listConfirmed,
  listHash,
  listError,
  closeDialog,
}: ListDialogProps) => {
  return (
    <dialog ref={dialogRef} className="z-10 bg-purple-400">
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
            onChange={(e) => setListingPrice(e.target.value)}
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
              `${!listingPrice && "bg-red-500"}`,
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
            Error: {(listError as BaseError).shortMessage || listError.message}
          </div>
        )}
        <button className="bg-slate-400" onClick={closeDialog}>
          Close
        </button>
      </div>
    </dialog>
  )
}

export default ListDialog
