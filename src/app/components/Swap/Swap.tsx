import { type ChangeEvent, useCallback, useEffect, useState } from 'react'
import { sendTransaction } from 'turboviem/actions'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
import { useAccount, useWalletClient } from 'wagmi'
import { swapperAbi } from '../../abi/swapper'
import { useGetQuote } from './hooks/useGetQuote'
import { useWaitForTransaction } from './hooks/useWaitForTransaction'

const swapper = '0xc1461E7A8f29109A8C2C0b60dAa1e12A317075AB'
const usdc = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

export function Swap() {
  const [amountIn, setAmountIn] = useState('0')
  const [debouncedAmountIn, setDebouncedAmountIn] = useState('0')
  const [amountOut, setAmountOut] = useState('0')
  const [transactionId, setTransactionId] = useState('')
  const { quote } = useGetQuote({ amountIn: debouncedAmountIn })
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { data: status } = useWaitForTransaction({ txId: transactionId })

  useEffect(() => {
    const delay = setTimeout(() => {
      setDebouncedAmountIn(amountIn)
    }, 500)
    return () => clearTimeout(delay)
  }, [amountIn])

  useEffect(() => {
    if (quote) {
      setAmountOut(Number.parseFloat(quote).toFixed(7))
    }
  }, [quote])

  const handleChangeAmount = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAmountIn(e.target.value)
  }, [])

  const handleSwap = useCallback(() => {
    if (walletClient && address) {
      void (async () => {
        const txId = await sendTransaction(walletClient, {
          chainId: 84532,
          sender: address,
          capabilities: { paymasterService: { url: 'http://localhost:3002/api' } },
          calls: [
            {
              target: usdc,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'approve',
                args: [swapper, parseUnits(amountIn, 6)],
              }),
            },
            {
              target: swapper,
              data: encodeFunctionData({
                abi: swapperAbi,
                functionName: 'swap',
                args: [parseUnits(amountIn, 6), parseUnits(quote, 18)],
              }),
            },
          ],
        })
        setTransactionId(txId)
      })()
    }
  }, [walletClient, address, amountIn, quote])

  return (
    <div className="flex flex-col w-full justify-center items-center space-y-10 h-96 relative">
      <div className="w-96 h-64 rounded-md shadow-2xl relative bg-zinc-800">
        <div className="w-full h-full flex flex-col rounded-md shadow-2xl bg-transparent divide-y-2 px-4 divide-white z-10">
          <div className="flex flex-row w-full h-full justify-between items-center">
            <input
              value={amountIn}
              onChange={handleChangeAmount}
              className="bg-transparent border-none h-full w-full flex items-center justify-center text-white px-2 text-4xl"
            />
            <span className="text-5xl text-white cursor-default inline-block bg-clip-text">
              USDC
            </span>
          </div>
          <div className="flex flex-row w-full h-full justify-between items-center">
            <input
              disabled
              className="bg-transparent border-none h-full w-full flex items-center justify-center text-white px-2 text-4xl disabled cursor-default"
              value={amountOut}
            />
            <span className="text-5xl text-white cursor-default inline-block bg-clip-text">
              WETH
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSwap}
        className="rounded-md bg-zinc-800 text-xl px-8 py-2 shadow-2xl text-white"
      >
        Swap
      </button>
      {status?.receipt?.transactionHash && (
        <a
          href={`https://sepolia.basescan.org/tx/${status.receipt.transactionHash}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white text-zinc-800 rounded-md text-xl px-4 py-2 absolute -bottom-10"
        >
          View swap
        </a>
      )}
    </div>
  )
}
