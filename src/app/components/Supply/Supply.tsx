import { type ChangeEvent, useCallback, useState } from 'react'
import { erc20Abi, parseUnits } from 'viem'
import { writeContracts } from 'viem/experimental'
import { useAccount, useWalletClient } from 'wagmi'
import { cometAbi } from '@/app/abi/cometAbi'
import { useWaitForTransaction } from './hooks/useWaitForTransaction'

const comet = '0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017'
const usdc = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

export function Supply() {
  const [amountIn, setAmountIn] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const { data: status } = useWaitForTransaction({ txId: transactionId })

  const handleChangeAmount = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAmountIn(e.target.value)
  }, [])

  const handleSupply = useCallback(async () => {
    if (walletClient && address) {
      const txId = await writeContracts(walletClient, {
        account: address,
        contracts: [
          {
            address: usdc,
            abi: erc20Abi,
            functionName: 'approve',
            args: [comet, parseUnits(amountIn, 6)],
          },
          {
            address: comet,
            abi: cometAbi,
            functionName: 'supply',
            args: [usdc, parseUnits(amountIn, 6)],
          },
        ],
      })
      setTransactionId(txId)
    }
  }, [walletClient, address, amountIn])

  return (
    <div className="flex flex-col w-full justify-center items-center space-y-10 h-96 relative">
      <div className="w-96 h-32 rounded-md shadow-2xl relative bg-zinc-800 flex flex-row justify-between items-center px-4">
        <input
          value={amountIn}
          onChange={handleChangeAmount}
          placeholder="0.00"
          className="bg-transparent border-none h-full w-full flex items-center justify-center text-green-400 px-2 text-4xl"
        />
        <span className="text-5xl text-green-400 cursor-default inline-block bg-clip-text">
          USDC
        </span>
      </div>
      <button
        type="button"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleSupply}
        className="rounded-md bg-zinc-800 text-xl px-8 py-2 shadow-2xl text-green-400"
      >
        Supply
      </button>
      {status?.receipts?.[0]?.transactionHash && (
        <a
          href={`https://sepolia.basescan.org/tx/${status.receipts?.[0].transactionHash}`}
          target="_blank"
          rel="noreferrer"
          className="bg-white text-zinc-800 rounded-md text-xl px-4 py-2 absolute -bottom-10"
        >
          View on Basescan
        </a>
      )}
    </div>
  )
}
