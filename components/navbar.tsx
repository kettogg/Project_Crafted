"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import React, { useState } from "react"

import { motion, useScroll, useMotionValueEvent } from "framer-motion"

import WalletWrapper from "@/components/wallet"

const navItems = [
  {
    name: "Explore",
    route: "/explore",
  },
  {
    name: "Create",
    route: "/studio/mint",
  },
  {
    name: "List",
    route: "/studio",
  },
  {
    name: "Profile",
    route: "/account",
  },
]

const Navbar = () => {
  const path = usePathname()

  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState<boolean>(false)

  useMotionValueEvent(scrollY, "change", (currScrollY) => {
    const prevScrollY = scrollY.getPrevious()
    if (prevScrollY && currScrollY > prevScrollY) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ type: "tween", duration: 0.32 }}
      className="fixed top-0 left-0 w-full h-[4.5rem] py-3 font-mono z-10 bg-black/75 backdrop-blur-md"
    >
      <div className="flex items-center gap-32 max-w-[1360px] w-full h-full mx-auto px-4 scr-1560:px-0">
        <Link href="/" className="text-3xl tracking-tight font-medium">
          Crafted
        </Link>
        <div className="grow flex items-center justify-between text-base tracking-tight">
          {navItems.map((item, index) => {
            return (
              <div key={index} className="px-2">
                <Link
                  className={`${path === item.route ? "text-foreground" : "text-muted-link"} hover:text-foreground transition-colors duration-200`}
                  href={item.route}
                >
                  {item.name}
                </Link>
              </div>
            )
          })}
          <div className="px-2">
            <WalletWrapper
              className="rounded-[0.2rem] px-[0.85rem] py-[0.4rem] transition-colors duration-200"
              text="Connect Wallet"
              withWalletAggregator={true}
            />
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
