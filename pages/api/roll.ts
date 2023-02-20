// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Currency, FlowMintedResult, TransactionHash } from '@tatumio/api-client'

import { TatumFlowSDK } from '@tatumio/flow';

const flowSDK = TatumFlowSDK({ apiKey: '78177955-ad41-47e7-bb54-1e0c21cdf821', testnet: true });
export const NFT_CONTRACT_ADDRESS = '96b5bdba-29b8-4df2-ad8a-b139e144e321';
const DEPLOYER_ACCOUNT = '0x8b0875529a6da050';
const DEPLOYER_PK = 'b79acb3fd72eb9eaf71f5e6823c2feda38353e75f2782f27287e70aa42cce4d1';

const getRandomAssetName = () => {
  const rndInt = Math.floor(Math.random() * 12) + 1
  switch(rndInt) {
    case 1:
      return 'pisces';
    case 2:
      return 'aries';
    case 3:
      return 'leo';
    case 4:
      return 'gemini';
    case 5:
      return 'virgo';
    case 6:
      return 'libra';
    case 7:
      return 'cancer';
    case 9:
      return 'scorpio';
    case 8:
      return 'capricorn';
    case 10:
      return 'sagittarius';
    case 11:
      return 'taurus';
    case 12:
    default:
      return 'gemini';
  }
}

const roll = async (dest_addr: string) => {
    const asset = getRandomAssetName();
    const nftMinted = (await flowSDK.nft.send.mintSignedTransaction({
        chain: Currency.FLOW,
        contractAddress: NFT_CONTRACT_ADDRESS,
        account: DEPLOYER_ACCOUNT,
        to: dest_addr,
        privateKey: DEPLOYER_PK,
        url: asset // unused for now. this is metadata
      })) as FlowMintedResult
    return { nftTokenId: nftMinted.tokenId, nftTxId: nftMinted.txId, nftType: asset };
}
type Data = {
    nft_token_id: string | undefined
    nft_type: string | undefined
    tx_id: string | undefined
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
    roll(req.headers.dest_addr as string).then(rollResult => {
    res.status(200).json({ nft_token_id: rollResult.nftTokenId, nft_type: rollResult.nftType, tx_id: rollResult.nftTxId })
  })
}
