import Head from 'next/head'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Spacer from '@/components/shared/spacer'
import { useState } from 'react'
import { useAsyncEffect } from 'usable-react'
import { getMagicInstance } from '@/libs/magic-sdk'

const inter = Inter({ subsets: ['latin'] });

export default function Login() {
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState('');

  useAsyncEffect(() => {
    const context = {
        hello: 'world'
    }
    console.log('context: ', context);
    return { 
        execute: async () => {
            const loggedIn = await getMagicInstance().user.isLoggedIn();
            setIsLoggedIn(loggedIn);
            if (isLoggedIn) {
                const { publicAddress: pubAddr } = await getMagicInstance().user.getMetadata();
                setPublicAddress(pubAddr || '')
            }
        }
     }
  }, [])

  const doLogin = async () => {
    await getMagicInstance().auth.loginWithEmailOTP({ email: userEmail });
    setIsLoggedIn(true);
    const { publicAddress: pubAddr } = await getMagicInstance().user.getMetadata();
    setPublicAddress(pubAddr || '')
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
      <button onClick={doLogin}>Login</button>
      <Spacer orientation="vertical" size={12} />
      {isLoggedIn && <div className={inter.className}>Flow Public Address: { publicAddress }</div>}
      </main>
    </>
  )
}
