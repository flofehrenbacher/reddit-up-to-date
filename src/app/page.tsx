'use client'

import axios from 'axios'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { Listing } from './model/reddit'

const inter = Inter({ subsets: ['latin'] })

type State = 'success' | 'loading' | 'error'

export default function Home() {
  const [state, setState] = useState<State>('loading')
  const [data, setData] = useState<Listing['data']['children']>([])

  useEffect(() => {
    fetchNewSubredditData('benhoward').then((data) => {
      setData(data.children)
      setState('success')
    })
  }, [])

  if (state === 'loading') {
    return <Loading />
  }

  return (
    <main className={`${inter.className}  h-screen snap-y snap-mandatory overflow-scroll`}>
      {data.map((item) => (
        <Section
          key={item.data.name}
          title={item.data.title}
          text={item.data.selftext}
          url={item.data.url}
        />
      ))}
      <Last />
    </main>
  )
}

interface Section {
  title: string
  text?: string
  url: string
}
function Section({ title, text, url }: Section) {
  return (
    <section className="h-5/6 -mb-4 snap-start snap-always p-8 bg-gradient-to-br even:from-cyan-800 even:to-blue-500 odd:text-slate-700 even:text-zinc-100 odd:from-slate-50 odd:to-slate-400 place-content-center overflow-hidden">
      <a href={url} className="h-full flex flex-col gap-5" target="_blank">
        <h2 className="text-3xl line-clamp-4 text-ellipsis">{title}</h2>
        <p className="line-clamp-6 text-ellipsis">{text}</p>
        <p className="self-start border-b-4 border-indigo-700">See post on reddit →</p>
      </a>
    </section>
  )
}

function Last() {
  return (
    <section className="h-screen grid place-content-center snap-start snap-always bg-green-800">
      <h2 className="text-2xl text-white">You are up to date 🏁</h2>
    </section>
  )
}

function Loading() {
  return (
    <section className="h-screen grid place-content-center snap-start snap-always bg-teal-800">
      <div className="animate-ping h-5 w-5 bg-slate-50"></div>
    </section>
  )
}

async function fetchNewSubredditData(subreddit: string) {
  const { data } = await axios.get<Listing>(`/api/posts/${subreddit}`)
  return data.data
}
