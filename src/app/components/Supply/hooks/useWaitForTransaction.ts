import { useQuery } from '@tanstack/react-query'
import { WalletClient } from 'viem'
import { getCallsStatus } from 'viem/experimental'
import { useWalletClient } from 'wagmi'

type UseWaitForTransactionProps = {
  txId: string
}

export function useWaitForTransaction({ txId }: UseWaitForTransactionProps) {
  const { data: walletClient } = useWalletClient()
  return useQuery({
    queryKey: ['transaction', txId],
    queryFn: async () => getCallsStatus(walletClient as WalletClient, { id: txId }),
    enabled: !!walletClient && !!txId,
    refetchInterval: (data) => data.state.data?.status === 'CONFIRMED' ? false : 1000,
  })
}
