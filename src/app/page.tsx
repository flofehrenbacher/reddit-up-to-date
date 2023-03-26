'use client'

import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import { useLocalStorageState } from './hooks/use-local-storage-state'
import { Link } from './model/reddit'

const inter = Inter({ subsets: ['latin'] })

const queryClient = new QueryClient()
export default function AppWithClientProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <UpToDate />
    </QueryClientProvider>
  )
}

function UpToDate() {
  const [before, setBefore] = useLocalStorageState<string | null>('before', null)

  const subreddit = 'benhoward'

  const { data, status, fetchNextPage } = useInfiniteQuery({
    queryKey: [subreddit],
    queryFn: ({ pageParam = before }) => {
      return fetchNewSubredditData(subreddit, pageParam)
    },
    getNextPageParam: (lastPage) => {
      const nextPageParam = lastPage.at(-1)?.data.name

      if (nextPageParam) {
        return nextPageParam
      }
    },
  })

  const pages = data?.pages ?? []
  const firstPost = pages.flat()[0]

  useEffect(() => {
    return () => {
      if (firstPost) {
        setBefore(firstPost.data.name)
      }
    }
  }, [firstPost, setBefore])

  if (status === 'loading') {
    return <Loading />
  }

  return (
    <main className={`${inter.className}  h-screen snap-y snap-mandatory overflow-scroll`}>
      {pages.map((page) => (
        <>
          {page.map((item) => {
            const created = new Date(item.data.created_utc * 1000)
            const date = `${created.toLocaleDateString('de')} ${created.toLocaleTimeString('de')}`
            return (
              <Section
                key={item.data.name}
                label={<Label link={item} />}
                title={item.data.title}
                text={item.data.selftext}
                url={item.data.url}
                date={date}
              />
            )
          })}
          <Last
            finish={() => {
              firstPost?.data.name && setBefore(firstPost.data.name)
              document.location.href = '/'
            }}
            resetToNow={() => {
              setBefore(null)
              document.location.href = '/'
            }}
          />
          ,
        </>
      ))}
    </main>
  )
}

interface Section {
  title: string
  text?: string
  date: string
  url: string
  label: JSX.Element
}
function Section({ title, text, url, date, label }: Section) {
  return (
    <section className="h-5/6 -mb-4 snap-start snap-always p-8 bg-gradient-to-br even:from-cyan-800 even:to-blue-500 odd:text-slate-200 even:text-slate-900 odd:from-slate-900 odd:to-slate-400 place-content-center overflow-hidden">
      <a href={url} className="h-full flex flex-col gap-5" target="_blank">
        <time>{date}</time>
        {label}
        <h2 className="text-3xl line-clamp-4 text-ellipsis">{title}</h2>
        <p className="line-clamp-6 text-ellipsis">{text}</p>
        <p className="self-start border-b-4 border-indigo-700">See post on reddit →</p>
      </a>
    </section>
  )
}

function Last({ finish, resetToNow }: { finish: () => void; resetToNow: () => void }) {
  return (
    <section className="flex-col gap-5 h-screen grid place-content-center snap-start snap-always bg-gradient-to-br from-green-800 to-green-400">
      <h2 className="text-2xl text-white">You are up to date 🏁</h2>
      <button
        onClick={() => {
          finish()
        }}
        className="rounded-full bg-cyan-600"
      >
        Finish for now
      </button>
      {
        <button
          onClick={() => {
            resetToNow()
          }}
          className="rounded-full bg-cyan-50"
        >
          Resest to now
        </button>
      }
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

async function fetchNewSubredditData(subreddit: string, before: string | null) {
  const { data } = await axios.get<Link[]>(`/api/posts/${subreddit}?before=${before}`)
  return data
}

function Label({ link }: { link: Link }) {
  return <p>{link.data.link_flair_text}</p>
}
