"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import React, { useState } from "react"

import { motion, useScroll, useMotionValueEvent } from "framer-motion"

import WalletWrapper from "@/components/wallet"
import HamburgerBtn from "./hamburger"

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

  const [menuOpen, setMenuOpen] = useState<boolean>(false) // Track if the menu is open

  useMotionValueEvent(scrollY, "change", (currScrollY) => {
    const prevScrollY = scrollY.getPrevious()
    if (prevScrollY && currScrollY > prevScrollY) {
      setHidden(true)
    } else {
      setHidden(false)
    }
  })

  const slideVariants = {
    open: {
      y: 0, // Slide down to original position
      transition: {
        duration: 0.4, // Animation duration
        ease: "easeInOut",
      },
    },
    closed: {
      y: "-100%", // Slide up and out of view
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ type: "tween", duration: 0.32 }}
      className="fixed top-0 left-0 w-full h-[4.5rem] py-3 font-mono z-20 bg-black/50 backdrop-blur-md"
    >
      <div className="relative flex justify-between items-center gap-32 max-w-[1360px] z-20 w-full h-full mx-auto px-4 scr-1560:px-0">
        <Link
          href="/"
          className="text-3xl font-mono font-medium tracking-tighter"
        >
          Crafted
        </Link>

        <div className="grow hidden md:block">
          <div className="flex items-center justify-between text-base tracking-tight">
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

        <HamburgerBtn
          className="md:hidden"
          speed={1.5}
          open={menuOpen}
          setOpen={setMenuOpen}
        />
      </div>
      {/* Sliding menu */}
      <motion.div
        className="fixed top-0 left-0 w-full min-h-36 h-[100vh] bg-background text-foreground z-10 shadow-lg"
        variants={slideVariants}
        initial="closed"
        animate={menuOpen ? "open" : "closed"}
      >
        <div className="flex flex-col items-center justify-center h-full text-xl tracking-tight">
          {navItems.map((item, index) => {
            return (
              <div key={index} className="px-2 py-4">
                <Link
                  className={`${path === item.route ? "text-foreground" : "text-muted-link"} hover:text-foreground transition-colors duration-200`}
                  href={item.route}
                >
                  {item.name}
                </Link>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default Navbar
