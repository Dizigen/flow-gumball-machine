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
fcl.config().put('challenge.handshake', 'http://access-001.devnet9.nodes.onflow.org:8000');

type RollModalProps ={
  showModal: Boolean;
  onCloseModal: () => void;
  destAddress: string;
  nftTokenId: string;
  status: string;
  nftType: string;
  nftTxId: string;
}

const Loader:React.FunctionComponent = (props) => {
  return <div className={styles.loader}/>
}

const callRollApi = async (dest_addr: string) => {
  const res = await (await fetch(`/api/roll`, {
    headers: {
      dest_addr
    }
  }));
  const data = await res.json();
  return data;
}

const RollModal:React.FunctionComponent<RollModalProps> = (props) => {
  const { showModal, onCloseModal, destAddress, nftTokenId, status, nftType, nftTxId } = props;

  return (showModal ? 
    <div className={`${styles.modalWrapper} ${inter.className}`}>
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <Spacer orientation="vertical" size={12} />
          <div>Your address: {destAddress}</div>
          <Spacer orientation="vertical" size={12} />
          <div>Status: {status}</div>
          <Spacer orientation="vertical" size={12} />
          <div>You got a: {nftType}</div>
          <Spacer orientation="vertical" size={12} />
          <div>Minted NFT TokenId: {nftTokenId}</div>
          <Spacer orientation="vertical" size={24} />
          {status === 'Done!' && <>
          <a href={"https://testnet.flowscan.org/transaction/" + nftTxId} target="_blank" rel="noreferrer">See on Flowscan</a>
          <Spacer orientation="vertical" size={12} />
          </>}
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
  const [showRollModal, setShowRollModal] = useState(false);

  // Results. Refreshes after every roll
  const [ nftTokenId, setNftTokenId ] = useState('');
  const [ nftType, setnftType ] = useState('');
  const [ status, setStatus ] = useState('');
  const [ nftTxId, setNftTxId ] = useState('');

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

  const getReferenceBlock = async () => {
    const response = await fcl.send([fcl.getBlock(false)]);
    const data = await fcl.decode(response);
    return data.id;
  };
  const doRoll = async () => {
    setShowRollModal(true);
    setStatus('Executing Authorization Function');
    const AUTHORIZATION_FUNCTION = getMagicInstance().flow.authorization;
    var response = await fcl.send([
      fcl.transaction`import TatumMultiNFT from 0x87fe4ebd0cddde06
      transaction {  
        prepare(signer: AuthAccount) {
          if signer.borrow<&TatumMultiNFT.Collection>(from: TatumMultiNFT.CollectionStoragePath) == nil {
            let collection <- TatumMultiNFT.createEmptyCollection()
            signer.save(<-collection, to: TatumMultiNFT.CollectionStoragePath)
            signer.link<&TatumMultiNFT.Collection>(TatumMultiNFT.CollectionPublicPath, target: TatumMultiNFT.CollectionStoragePath)
          }
        }
      }`,
      fcl.ref(await getReferenceBlock()),
      fcl.proposer(AUTHORIZATION_FUNCTION),
      fcl.authorizations([AUTHORIZATION_FUNCTION]),
      fcl.payer(AUTHORIZATION_FUNCTION),
    ]);
    setStatus('Waiting for function to be sealed')
    await fcl.tx(response).onceSealed();
    setStatus('Rolling for an NFT')
    const { nft_token_id, nft_type, tx_id } = await callRollApi(publicAddress);
    setStatus('Done!')
    setNftTokenId(nft_token_id);
    setnftType(nft_type);
    setNftTxId(tx_id);
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
              onClick={doRoll}>Roll for a Gumball</button>
            <Spacer orientation="vertical" size={12} />
            <button 
              style={{height: '36px', cursor: 'pointer'}}
              onClick={doLogout}>Logout</button>
          </div>
        </div>}
      </main>
      {
        showRollModal &&
          <RollModal
            showModal={showRollModal}
            onCloseModal={() => setShowRollModal(false)}
            destAddress={publicAddress}
            nftTokenId={nftTokenId}
            status={status}
            nftType={nftType}
            nftTxId={nftTxId}/>
      }
    </>
  )
}
