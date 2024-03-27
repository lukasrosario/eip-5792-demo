import { NextRequest, NextResponse } from 'next/server'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(r: NextRequest) {
  const req = await r.json()
  const [userOp, entrypoint] = req.params

  const data = {
    id: 1,
    jsonrpc: '2.0',
    method: 'eth_paymasterAndDataForUserOperation',
    params: [userOp, entrypoint, '0x14A34'],
  }

  const paymasterResult = await fetch('https://paymaster.base.org', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(data),
  })
  const result = await paymasterResult.json()

  return NextResponse.json(
    {
      id: 1,
      jsonrpc: '2.0',
      result: { paymasterAndData: result.result },
    },
    { headers: corsHeaders },
  )
}
