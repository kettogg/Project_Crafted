"use client"

import React, { useState, useEffect } from "react"

import { motion } from "framer-motion"

import { useAccount, useReadContract } from "wagmi"

import Backdrop from "@/components/backdrop"
import FeaturedCard from "@/components/featured"

import { ABI, ADDRESS } from "@/contract"

import { MarketItem } from "@/lib/types"

import { featuredTokenIds } from "@/data/featured"
import IdentityWrapper from "./identity"
import { div } from "framer-motion/client"

const Hero = () => {
  const [bgImageUrl, setBgImageUrl] = useState<string>("")
  const [selectedCard, setSelectedCard] = useState<bigint | null>(null)
  const [hoveredCard, setHoveredCard] = useState<bigint | null>(null)

  const handleCardClick = (url: string, tokenId: bigint) => {
    setBgImageUrl(url)
    setSelectedCard(tokenId)
  }

  const handleCardHover = (tokenId: bigint) => {
    setHoveredCard(tokenId)
  }

  const handleCardHoverEnd = () => {
    setHoveredCard(null)
  }

  return (
    <section className="relative flex flex-col max-w-[1560px] w-full mx-auto overflow-hidden border-none">
      <img src={bgImageUrl} alt="" />
      <div>Hello</div>
      {featuredTokenIds.map((tokenId) => {
        const isSelected = selectedCard === tokenId
        const isHovered = hoveredCard === tokenId
        const isOtherHovered = hoveredCard !== null && hoveredCard !== tokenId

        return (
          <motion.div
            className="bg-blue-300"
            key={tokenId}
            animate={{
              y:
                isHovered || (!isHovered && !isOtherHovered && isSelected)
                  ? -8
                  : isSelected && isOtherHovered
                    ? 0
                    : 0,
              transition: { duration: 0.3 },
            }}
            onMouseEnter={() => handleCardHover(tokenId)}
            onMouseLeave={handleCardHoverEnd}
          >
            <FeaturedCard
              tokenId={tokenId}
              isSelected={isSelected}
              isHovered={isHovered}
              isOtherHovered={isOtherHovered}
              onClick={handleCardClick}
            />
          </motion.div>
        )
      })}
      <IdentityWrapper />
    </section>
  )
}

export default Hero
