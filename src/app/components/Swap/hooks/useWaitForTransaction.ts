import { useQuery } from '@tanstack/react-query'
import { getTransactionStatus } from 'turboviem/actions'
import { WalletClient } from 'viem'
import { useWalletClient } from 'wagmi'

type UseWaitForTransactionProps = {
  txId: string
}

export function useWaitForTransaction({ txId }: UseWaitForTransactionProps) {
  const { data: walletClient } = useWalletClient()
  return useQuery({
    queryKey: ['transaction', txId],
    queryFn: async () => getTransactionStatus(walletClient as WalletClient, { transactionId: txId }),
    enabled: !!walletClient && !!txId,
    refetchInterval: 1000,
  })
}
