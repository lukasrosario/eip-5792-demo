import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import { FeeAmount } from '@uniswap/v3-sdk'
import { decodeAbiParameters, encodeFunctionData, formatUnits, parseAbiParameters, parseUnits } from 'viem'
import { useCall } from 'wagmi'

// Using L1 addresses to get realistic quotes
const quoter = '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a'
const usdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const weth = '0x4200000000000000000000000000000000000006'

type UseGetQuoteProps = {
  amountIn: string
}

export function useGetQuote({ amountIn }: UseGetQuoteProps) {
  const { data: quotedAmount } = useCall({
    to: quoter,
    data: encodeFunctionData({
      abi: Quoter.abi,
      functionName: 'quoteExactInputSingle',
      args: [
        {
          tokenIn: usdc,
          tokenOut: weth,
          fee: FeeAmount.LOW,
          amountIn: parseUnits(amountIn, 6),
          sqrtPriceLimitX96: 0,
        },
      ],
    }),
    chainId: 8453,
    query: { enabled: !!amountIn && amountIn !== '0' },
  })

  let amountOut = BigInt(0)
  if (quotedAmount?.data) {
    const decoded = decodeAbiParameters(
      parseAbiParameters(
        'uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed,uint256 gasEstimate',
      ),
      quotedAmount.data,
    )
    amountOut = decoded[0]
  }

  return { quote: formatUnits(amountOut, 18) }
}
