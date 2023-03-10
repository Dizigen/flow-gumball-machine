import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import Link from 'next/link'
import Spacer from '@/components/shared/spacer'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
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
        Hello
      </h2>
      <Spacer orientation="vertical" size={12}/>
      <Link className={inter.className} href="/roll"><b>Roll for Gumballs</b></Link>
      </main>
    </>
  )
}
