type MarketItem = {
  tokenId: bigint
  creator: `0x${string}`
  currentOwner: `0x${string}`
  price: bigint
  royaltyFeePercent: number
  isListed: boolean
}

type Address = `0x${string}`

export type { MarketItem, Address }
