import React from "react"

import { ConnectButton } from "@rainbow-me/rainbowkit"

const Navbar = () => {
  return (
    <header className="h-20 w-full flex items-center bg-blue-400">
      <span>Navbar</span>
      <ConnectButton />
    </header>
  )
}

export default Navbar
