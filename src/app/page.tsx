'use client'

import { useCallback, useEffect } from 'react'
import { useAccount, useConnect, useSwitchChain } from 'wagmi'
import { Supply } from './components/Supply/Supply'
import { truncateMiddle } from './util/turncateMiddle'

function App() {
  const { address } = useAccount()
  const { connectors, connect } = useConnect()
  const { switchChain } = useSwitchChain()

  useEffect(() => {
    switchChain({ chainId: 84532 })
  }, [address, switchChain])

  const handleConnect = useCallback(() => {
    connect({ connector: connectors[0] })
  }, [connect, connectors])

  return (
    <div className="flex relative flex-col h-screen w-full items-center justify-center bg-zinc-900">
      <span className="absolute top-8 left-12 text-green-400 text-3xl">Compound Supplier</span>
      <div className="absolute flex top-8 right-12">
        <button
          onClick={handleConnect}
          type="button"
          className="bg-zinc-800 text-green-400 w-48 py-2 rounded-md shadow-2xl"
        >
          {address ? truncateMiddle(address, 6, 3) : connectors[0].name}
        </button>
      </div>
      <Supply />
    </div>
  )
}

export default App
