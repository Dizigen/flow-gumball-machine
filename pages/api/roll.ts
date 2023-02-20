// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Currency, FlowMintedResult, TransactionHash } from '@tatumio/api-client'

import { TatumFlowSDK } from '@tatumio/flow';

const flowSDK = TatumFlowSDK({ apiKey: '78177955-ad41-47e7-bb54-1e0c21cdf821', testnet: true });
const NFT_CONTRACT_ADDRESS = '96b5bdba-29b8-4df2-ad8a-b139e144e321';
const DEPLOYER_ACCOUNT = '0x8b0875529a6da050';
const DEPLOYER_PK = 'b79acb3fd72eb9eaf71f5e6823c2feda38353e75f2782f27287e70aa42cce4d1';

const getRandomAssetName = () => {
  return 'gemini'
}

const roll = async (dest_addr: string) => {
    const nftMinted = (await flowSDK.nft.send.mintSignedTransaction({
        chain: Currency.FLOW,
        contractAddress: NFT_CONTRACT_ADDRESS,
        account: DEPLOYER_ACCOUNT,
        to: dest_addr,
        privateKey: DEPLOYER_PK,
        url: getRandomAssetName() // unused for now. this is metadata
      })) as FlowMintedResult
    return nftMinted.tokenId;
}
type Data = {
    nft_token_id: string | undefined
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    roll(req.headers.dest_addr as string).then(nftTokenId => {
    res.status(200).json({ nft_token_id: nftTokenId })
  })
}
