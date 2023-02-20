// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Currency, TransactionHash } from '@tatumio/api-client';
import { TatumFlowSDK } from '@tatumio/flow';

const flowSDK = TatumFlowSDK({ apiKey: '78177955-ad41-47e7-bb54-1e0c21cdf821', testnet: true });

// Test deployment wallets
let private_key: string, account: string;

const doDeployContract = async () => {
  const { mnemonic, xpub } = await flowSDK.wallet.generateWallet()
  const { address: firstAddress } = await flowSDK.blockchain.generateAddress(xpub, 0)
  account = firstAddress as string
  private_key = await flowSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 0)
  const txnHash = (await flowSDK.nft.deployNFTSmartContract({
      chain: Currency.FLOW,
      privateKey: private_key,
      account: account,
  })) as TransactionHash;
  const contractAddressRes = await flowSDK.blockchain.smartContractGetAddress(Currency.FLOW, txnHash.txId);
  return contractAddressRes.contractAddress;
}
type Data = {
  contract_address: string | undefined
  private_key: string
  account: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  doDeployContract().then(contractAddress => {
    res.status(200).json({ contract_address: contractAddress, private_key, account })
  })
}
