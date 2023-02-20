import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Spacer from '@/components/shared/spacer'
import { useState } from 'react'
import { useAsyncEffect } from 'usable-react'
import { getMagicInstance } from '@/libs/magic-sdk'
import Image from 'next/image';
import Link from 'next/link'
const fcl = require("@onflow/fcl");

const inter = Inter({ subsets: ['latin'] });
const FLOW_TOKEN_OFFSET = 10000000;

fcl.config().put('accessNode.api', 'https://rest-testnet.onflow.org');

type PaymentModalProps ={
  showModal: Boolean;
  onCloseModal: () => void
}

const Loader:React.FunctionComponent = (props) => {
  return <div className={styles.loader}/>
}

const callDeployContractApi = async () => {
  const res = await (await fetch(`/api/hello`));
  const data = await res.json();
  return data;
}

const callMintContractApi = async (tokenContractAddress: string, account: string, pk: string, url: string) => {
  const res = await (await fetch(`/api/mint`, {
    headers: {
      contract_address: tokenContractAddress,
      account,
      pk,
      url
    }
  }));
  const data = await res.json();
  return data.nft_token_id;
}

const PaymentModal:React.FunctionComponent<PaymentModalProps> = (props) => {
  fcl.config().put('accessNode.api', 'https://rest-testnet.onflow.org');
  const { showModal, onCloseModal } = props;
  const [ nftTokenId, setNftTokenId ] = useState('');
  const [ deployedContractAddress, setDeployedContractAddress ] = useState('');
  const [ deployerAccount, setDeployerAccount ] = useState('');
  const [ deployerPK, setDeployerPK ] = useState('');
  const [ assetUrl, setAssetUrl ] = useState('ipfs://bafybeidi7xixphrxar6humruz4mn6ul7nzmres7j4triakpfabiezll4ti/metadata.json');

  const doDeployContract = async () => {
    const resDeployContract = await callDeployContractApi();
    setDeployedContractAddress(resDeployContract.contract_address);
    setDeployerAccount(resDeployContract.account);
    setDeployerPK(resDeployContract.private_key);
  }

  const doMintNFT = async () => {
    const nft_tokenId = await callMintContractApi(deployedContractAddress, deployerAccount, deployerPK, assetUrl);
    setNftTokenId(nft_tokenId);
  }

  return (showModal ? 
    <div className={`${styles.modalWrapper} ${inter.className}`}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div>IPFS Url: <input 
            value={assetUrl}
            onChange={(e) => setAssetUrl(e.target.value)}
            style={{height: '36px', width: '200px'}}/> </div>
          <Spacer orientation="vertical" size={12} />
          <button onClick={doDeployContract} style={{width: '200px', height: '32px'}}>Deploy Contract</button>
          <Spacer orientation="vertical" size={12} />
          <div>NFT Contract Address: {deployedContractAddress}</div>
          <div>Deployer Account: {deployerAccount}</div>
          <div>Deployer PK: {deployerPK}</div>
          <Spacer orientation="vertical" size={36}/>
          <button onClick={doMintNFT} style={{width: '200px', height: '32px'}}>Mint a Doohikkie</button>
          <Spacer orientation="vertical" size={12} />
          <div>Minted NFT TokenId: {nftTokenId}</div>
          <Spacer orientation="vertical" size={24} />
          <button onClick={onCloseModal} style={{width: '200px', height: '32px'}}>Close</button>
        </div>
      </div>
    </div>
    : <></>
  )
}

export default function Login() {
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState(undefined);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useAsyncEffect(() => {
    const context = {
        hello: 'world'
    }
    return { 
        execute: async () => {
            const loggedIn = await getMagicInstance().user.isLoggedIn();
            setIsLoggedIn(loggedIn);
            if (loggedIn) {
                const { publicAddress: pubAddr } = await getMagicInstance().user.getMetadata();
                setPublicAddress(pubAddr || '');
                const acc = await fcl.account(pubAddr);
                setAccountBalance(acc.balance);
            }
            setIsLoading(false);
        }
     }
  }, [])

  const doLogin = async () => {
    await getMagicInstance().auth.loginWithEmailOTP({ email: userEmail });
    setIsLoggedIn(true);
    const { publicAddress: pubAddr } = await getMagicInstance().user.getMetadata();
    setPublicAddress(pubAddr || '');
    const acc = await fcl.account(pubAddr);
    setAccountBalance(acc.balance);
  }

  const doLogout = async () => {
    setIsLoading(true);
    await getMagicInstance().user.logout();
    setIsLoggedIn(false)
    setIsLoading(false);
  }

  return (
    <>
      <Head>
        <title>Flow Gumball Machine</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {isLoading && <Loader />}
        {!isLoggedIn &&
          <>
            <h2 className={inter.className}>
              Enter Email to Login
            </h2>
            <Spacer orientation="vertical" size={12} />
            <input 
              className={`${styles.loginInput} ${inter.className}`} 
              type="text" 
              value={userEmail} 
              onChange={(e) => setUserEmail(e.target.value)} />
            <Spacer orientation="vertical" size={12} />
            <button style={{height: '36px', cursor: 'pointer'}} onClick={doLogin}>Login</button>
            <Spacer orientation="vertical" size={12} />
          </>
        }
      {isLoggedIn && 
        <div className={inter.className}>
          <div>Public Address: { publicAddress }</div>
          <div>Tokens (not that it matters): { ((accountBalance || 0) / FLOW_TOKEN_OFFSET) } </div>
          <Link
            href="https://testnet-faucet.onflow.org/fund-account"
            style={{textDecoration: 'underline'}}
            target="_blank">Testnet Faucet</Link>
          <Spacer orientation="vertical" size={24} />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Image src="/gumball-machine.png" alt="" width={480} height={480}/>
            <Spacer orientation="vertical" size={24} />
            <button 
              style={{height: '36px', cursor: 'pointer'}}
              onClick={() => setShowPaymentModal(true)}>Roll for $3</button>
            <Spacer orientation="vertical" size={12} />
            <button 
              style={{height: '36px', cursor: 'pointer'}}
              onClick={doLogout}>Logout</button>
          </div>
        </div>}
      </main>
      {
        showPaymentModal && <PaymentModal showModal={showPaymentModal} onCloseModal={() => setShowPaymentModal(false)}/>
      }
    </>
  )
}
