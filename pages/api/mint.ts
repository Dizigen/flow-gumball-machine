// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Currency, FlowMintedResult } from '@tatumio/api-client'

import { TatumFlowSDK } from '@tatumio/flow';

const flowSDK = TatumFlowSDK({ apiKey: '78177955-ad41-47e7-bb54-1e0c21cdf821', testnet: true });

const mint = async (contractAddress: string, account: string, privateKey: string, url: string) => {
    const nftMinted = (await flowSDK.nft.send.mintSignedTransaction({
        chain: Currency.FLOW,
        contractAddress,
        account,
        to: account,
        privateKey,
        // uploaded metadata from ipfs
        url // 'ipfs://bafybeidi7xixphrxar6humruz4mn6ul7nzmres7j4triakpfabiezll4ti/metadata.json',
      })) as FlowMintedResult
      console.log('nftMinted.txId:', nftMinted.txId);
    return nftMinted.tokenId;
}
type Data = {
    nft_token_id: string | undefined
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    mint(req.headers.contract_address as string, req.headers.account as string, req.headers.pk as string, req.headers.url as string).then(nftTokenId => {
    res.status(200).json({ nft_token_id: nftTokenId })
  })
}
