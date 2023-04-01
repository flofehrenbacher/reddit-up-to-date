'use client'

import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { useLocalStorageState } from './hooks/use-local-storage-state'
import { Link } from './model/reddit'

const inter = Inter({ subsets: ['latin'] })

const queryClient = new QueryClient()
export default function AppWithClientProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className={`${inter.className} h-screen snap-y snap-mandatory overflow-scroll`}>
        <UpToDate />
      </main>
    </QueryClientProvider>
  )
}

function UpToDate() {
  const [before, setBefore] = useLocalStorageState<string | null>('before', null)
  const [loadMoreState, setLoadMoreState] = useState<'initial' | 'more'>('initial')

  const subreddit = 'benhoward'

  const { data: newData, status } = useQuery(['new', subreddit], async () =>
    fetchSubredditDataBefore(subreddit, before),
  )
  const newPosts = newData ?? []
  const firstNewPost = newPosts.at(0)
  const lastNewPost = newPosts.at(-1)

  useEffect(() => {
    if (firstNewPost) {
      setBefore(firstNewPost.data.name)
    }
  }, [firstNewPost, setBefore])

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['more', subreddit],
    enabled: loadMoreState === 'more',
    queryFn: ({ pageParam = lastNewPost?.data.name }) => {
      return fetchSubredditDataAfter(subreddit, pageParam)
    },
    getNextPageParam: (lastPage) => {
      const nextPageParam = lastPage.at(-1)?.data.name

      if (nextPageParam) {
        return nextPageParam
      }
    },
  })
  const olderPosts = (data?.pages ?? []).at(-1) ?? []

  if (status === 'loading' || isFetchingNextPage) {
    return <Loading />
  }

  if (loadMoreState === 'initial') {
    return (
      <>
        {newPosts.map((post) => {
          const created = new Date(post.data.created_utc * 1000)
          const date = `${created.toLocaleDateString('de')} ${created.toLocaleTimeString('de')}`
          return (
            <Section
              key={post.data.name}
              label={<Label link={post} />}
              title={post.data.title}
              text={post.data.selftext}
              url={post.data.url}
              date={date}
            />
          )
        })}
        <Last loadMore={() => setLoadMoreState('more')} />
      </>
    )
  }
  return (
    <>
      {olderPosts.map((post) => {
        const created = new Date(post.data.created_utc * 1000)
        const date = `${created.toLocaleDateString('de')} ${created.toLocaleTimeString('de')}`
        return (
          <Section
            key={post.data.name}
            label={<Label link={post} />}
            title={post.data.title}
            text={post.data.selftext}
            url={post.data.url}
            date={date}
          />
        )
      })}
      {olderPosts.length > 0 ? (
        <Last
          loadMore={() => {
            fetchNextPage()
          }}
        />
      ) : null}
    </>
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

function Last({ loadMore }: { loadMore: () => void }) {
  return (
    <section className="flex-col gap-5 h-5/6 grid place-content-center snap-start snap-always bg-gradient-to-br from-green-800 to-green-400">
      <h2 className="text-2xl text-white">You are up to date 🏁</h2>
      <button
        onClick={() => {
          loadMore()
        }}
        className="rounded-full bg-cyan-50"
      >
        Show older posts
      </button>
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

async function fetchSubredditDataBefore(subreddit: string, before: string | null) {
  const { data } = await axios.get<Link[]>(`/api/posts/${subreddit}?before=${before}`)
  return data
}

async function fetchSubredditDataAfter(subreddit: string, after: string | null) {
  const { data } = await axios.get<Link[]>(`/api/posts/${subreddit}?after=${after}`)
  return data
}

function Label({ link }: { link: Link }) {
  return <p>{link.data.link_flair_text}</p>
}
