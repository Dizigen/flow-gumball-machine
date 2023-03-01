/* eslint-disable @next/next/no-sync-scripts */
import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Spacer from '@/components/shared/spacer'
import { useEffect, useState } from 'react'
import { useAsyncEffect } from 'usable-react'
import { getMagicInstance } from '@/libs/magic-sdk'
// import Image from 'next/image';
const fcl = require("@onflow/fcl");
import { TatumFlowSDK } from '@tatumio/flow';
import { Currency } from '@tatumio/api-client'
import { NFT_CONTRACT_ADDRESS } from './api/roll';

const inter = Inter({ subsets: ['latin'] });

fcl.config().put('accessNode.api', 'https://rest-testnet.onflow.org');
fcl.config().put('challenge.handshake', 'http://access-001.devnet9.nodes.onflow.org:8000');

const flowSDK = TatumFlowSDK({ apiKey: '78177955-ad41-47e7-bb54-1e0c21cdf821', testnet: true });

const getReferenceBlock = async () => {
  const response = await fcl.send([fcl.getBlock(false)]);
  const data = await fcl.decode(response);
  return data.id;
};

function countStrings(arr) {
  let freq = {};
  for (let str of arr) {
    if (freq[str]) {
      freq[str]++;
    } else {
      freq[str] = 1;
    }
  }
  return freq;
}

const doAuthorizeAccount = async () => {
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
  return response;
}

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

/* const RollModal:React.FunctionComponent<RollModalProps> = (props) => {
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
}*/

export default function Login() {
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState('');
  const [showRollModal, setShowRollModal] = useState(false);
  const [nftBalance, setNftBalance] = useState([] as any);

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
                setPublicAddress(pubAddr as string);
                const assets = new Array();
                const nftAccountBalance = (await flowSDK.nft.getNFTAccountBalance(Currency.FLOW, pubAddr as string, NFT_CONTRACT_ADDRESS)) as Array<string>;
                for (let i = 0; i < nftAccountBalance.length; i++) {
                  const assetName = await flowSDK.nft.getNFTMetadataURI(Currency.FLOW, NFT_CONTRACT_ADDRESS, nftAccountBalance[i], pubAddr as string);
                  assets.unshift((assetName as any).data);
                }
                setNftBalance(countStrings(assets));
                setIsLoading(false);
                const loaderUrl = "Build/builds.loader.js";
                var script = window.document.createElement("script");
                if ((window as any).scriptTag) return;
                (window as any).scriptTag = script;
                script.src = loaderUrl;
                console.log('createUnityInstance');
                script.onload = () => {
                  (window as any).createUnityInstance(document.querySelector("#unity-canvas"), {
                    dataUrl: "Build/builds.data",
                    frameworkUrl: "Build/builds.framework.js",
                    codeUrl: "Build/builds.wasm",
                    streamingAssetsUrl: "StreamingAssets",
                    companyName: "DefaultCompany",
                    productName: "SpacePop",
                    productVersion: "0.1",
                    // matchWebGLToCanvasSize: false, // Uncomment this to separately control WebGL canvas render size and DOM element size.
                    // devicePixelRatio: 1, // Uncomment this to override low DPI rendering on high DPI displays.
                  }).then((instance) => {
                    //only one event which is when they want to pull and nft. No error handling in game.
                    //can later add a fucntion to call which will reload scene in case of no funds.
                    (window as any).flowPubEvent = function(event) {
                      // console.log('window.flowPubEvent', event)
                      (window as any).doRoll();
                    };
                    (window as any).unityInstance = instance;
                    (window as any).unityInstance.SendMessage('ViewController', 'LoadWallet', JSON.stringify({flowTokens: 0, nfts: countStrings(assets)}));
                  });
                };
                window.document.body.appendChild(script);
            }
            setIsLoading(false);
          }
     }
  }, [])

  const doLogin = async () => {
    setIsLoading(true);
    const token = await getMagicInstance().webauthn.registerNewUser({ username: userEmail });
    setIsLoggedIn(true);
    const { publicAddress: pubAddr } = await getMagicInstance().user.getMetadata();
    setPublicAddress(pubAddr || '');
    const response = await doAuthorizeAccount();
    await fcl.tx(response).onceSealed();
    setIsLoading(false);
  }

  const doLogout = async () => {
    setIsLoading(true);
    await getMagicInstance().user.logout();
    setIsLoggedIn(false)
    setIsLoading(false);
  }

  if (typeof window === 'undefined') return null;
  (window as any).doRoll = async () => {
    const { nft_token_id, nft_type, tx_id } = await callRollApi(publicAddress);
    (window as any).unityInstance.SendMessage('Pull Zodiac', 'OnMintNft', nft_type.charAt(0).toUpperCase() + nft_type.slice(1));
    setNftTokenId(nft_token_id);
    setnftType(nft_type);
    setNftTxId(tx_id);
    const updatedAssets = nftBalance;
    if (updatedAssets[nft_type]) {
      updatedAssets[nft_type]++;
    }
    else {
      updatedAssets[nft_type] = 1;
    }
    setNftBalance(updatedAssets);
    console.log('updatedAssets', updatedAssets);
    (window as any).unityInstance.SendMessage('ViewController', 'LoadWallet', JSON.stringify({flowTokens: 0, nfts: updatedAssets}));

  }

  /* const closeModal = () => {
    setNftTokenId('');
    setnftType('');
    setNftTxId('');
    setStatus('')
    setShowRollModal(false);
  } */

  return (
    <>
      <Head>
        <title>Flow Gumball Machine</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
      <canvas 
        id="unity-canvas"
        width="372"
        tabIndex={1}
        height="804"
        style={{width: "372px", height: "804px", background: "#231F20", display: `${isLoading || !isLoggedIn ? 'none' : 'block'}`}} />
        {isLoading && <Loader />}
        {!isLoggedIn &&
          <>
            <h2 className={inter.className}>
              Enter a User Name
            </h2>
            <Spacer orientation="vertical" size={12} />
            <input type="text" className={styles.loginInput} value={userEmail} onChange={(e) => setUserEmail(e.target.value)}/>
            <Spacer orientation="vertical" size={12} />
            <button style={{height: '36px', cursor: 'pointer', padding: '0 12px'}} onClick={doLogin}>Login with Passkey</button>
            <Spacer orientation="vertical" size={12} />
          </>
        }
      {/*isLoggedIn && 
        <div className={inter.className}>
          <div>Public Address: { publicAddress }</div>
          <div style={{ width: '400px'}}>Collection: [ {nftBalance.map((tokenName:string) => <>{tokenName}, </>)} ]</div>
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
      </div>*/
      isLoggedIn && <button style={{height: '36px', cursor: 'pointer'}} onClick={doLogout}>Logout</button>
      }

      </main>
      {
        /*showRollModal &&
          <RollModal
            showModal={showRollModal}
            onCloseModal={closeModal}
            destAddress={publicAddress}
            nftTokenId={nftTokenId}
            status={status}
            nftType={nftType}
            nftTxId={nftTxId}/>*/
      }
    </>
  )
}
