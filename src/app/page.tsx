'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCapabilities, getTransactionStatus, sendTransaction } from 'turboviem/actions'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi'

function App() {
  const account = useAccount()
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const sender = useAccount().address
  const { data: client } = useWalletClient()
  const { switchChain } = useSwitchChain()
  const [txIdInput, setTxIdInput] = useState('')
  const [capabilities, setCapabilities] = useState({})
  const [transactionId, setTransactionId] = useState('')
  const [transactionStatus, setTransactionStatus] = useState({})

  const handleGetCapabilities = useCallback(async () => {
    if (sender && client) {
      const capabilities = await getCapabilities(client)
      setCapabilities(capabilities)
    }
  }, [sender, client])

  const handleSendTransaction = useCallback(async () => {
    if (sender && client) {
      const txId = await sendTransaction(client, {
        chainId: 84532,
        sender,
        calls: [
          { target: sender, data: '0x', value: BigInt(1) },
          { target: sender, data: '0x', value: BigInt(2) },
        ],
      })
      setTransactionId(txId)
    }
  }, [sender, client])

  const handleGetTransactionStatus = useCallback(async () => {
    if (client) {
      const status = await getTransactionStatus(client, { transactionId: txIdInput })
      setTransactionStatus(status)
    }
  }, [client, txIdInput])

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === 'connected' && (
          <button type='button' onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type='button'
          >
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>

      <div>
        <div>
          <button onClick={() => switchChain({ chainId: 84532 })}>Switch to base sepolia</button>
        </div>
        <div>
          <button onClick={handleGetCapabilities}>Capabilities</button>
          <div>{JSON.stringify(capabilities)}</div>
          <div>{JSON.stringify((capabilities as Record<number, Record<string, any>>)[84532])}</div>
        </div>
        <div>
          <button onClick={handleSendTransaction}>Send transaction</button>
          <div>{transactionId}</div>
        </div>
        <div>
          <button onClick={handleGetTransactionStatus}>Get transaction status</button>
          <input
            placeholder='transaction id'
            value={txIdInput}
            onChange={(e) => {
              setTxIdInput(e.target.value)
            }}
          />
          <div>
            {JSON.stringify(JSON.parse(JSON.stringify(transactionStatus, (_, value) =>
              typeof value === 'bigint'
                ? value.toString()
                : value)))}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
