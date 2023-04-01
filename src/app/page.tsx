'use client'

import { QueryClient, QueryClientProvider, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react'
import { useLocalStorageState } from './hooks/use-local-storage-state'
import { Link } from './model/reddit'
import { generateRandomPastelColors } from './utils/generate-random-pastel-colors'

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

  const { data, fetchNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery({
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

  if (status === 'loading' || isFetchingNextPage || isFetching) {
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
  const { bgColor, textColor } = generateRandomPastelColors()

  return (
    <section
      style={{ background: bgColor, color: textColor }}
      className={`h-5/6 -mb-4 snap-start snap-always p-8 place-content-center overflow-hidden`}
    >
      <a href={url} className="h-full flex flex-col gap-5" target="_blank">
        <time>{date}</time>
        {label}
        <h2 className="text-3xl text-ellipsis">{title}</h2>
        {text ? (
          <div className="relative">
            <div className="h-max overflow-hidden" dangerouslySetInnerHTML={{ __html: text }}></div>
            <div
              style={{ background: `linear-gradient(rgb(255 255 255 / 0) 70%, ${bgColor})` }}
              className="h-full absolute top-0 left-0 w-full"
            ></div>
          </div>
        ) : null}
        <p className="self-start">See post on reddit →</p>
      </a>
    </section>
  )
}

function Last({ loadMore }: { loadMore: () => void }) {
  return (
    <section
      onClick={() => {
        loadMore()
      }}
      className="hover:cursor-pointer flex-col gap-y-8 h-full grid place-content-center snap-start snap-always bg-slate-600"
    >
      <div className="grid place-content-center">
        <ImageSuccessFilled size={100} />
      </div>
      <h2 className="text-2xl text-white">You are up to date</h2>
      <button className="block rounded-full bg-cyan-50">Show older posts</button>
    </section>
  )
}

function Loading() {
  return (
    <section className="h-screen grid place-content-center snap-start snap-always bg-teal-800">
      <div className="animate-ping">
        <BinocularFilled size={40} />
      </div>
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
  return <p className="text-xl">{link.data.link_flair_text}</p>
}

function ImageSuccessFilled({ size }: { size: number }) {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="2 4 22 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FFE7C2"
          d="M15.07 9.45996L11.58 15.05C11.26 15.56 10.57 15.67 10.11 15.3L6.90997 12.74C6.42997 12.35 5.71997 12.49 5.40997 13.03L2.32997 18.51C1.94997 19.18 2.42997 20 3.18997 20H20.8C21.56 20 22.04 19.19 21.68 18.52L16.8 9.50996C16.44 8.83996 15.48 8.80996 15.07 9.45996Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path
          fill="#FFE7C2"
          d="M8.97998 10C10.08 10 10.98 9.1 10.98 8C10.98 6.9 10.08 6 8.97998 6C7.87998 6 6.97998 6.9 6.97998 8C6.97998 9.1 7.87998 10 8.97998 10Z"
        ></path>
        <path
          fill="#9E6B93"
          d="M23.1071 3.85708L19.4 7.56419L16.8929 5.05708L18.3071 3.64287L19.4 4.73576L21.6929 2.44287L23.1071 3.85708Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
      </svg>
    </>
  )
}

function BinocularFilled({ size }: { size: number }) {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FDD17B"
          d="M2 21C2 20.4477 2.44772 20 3 20H9C9.55228 20 10 20.4477 10 21C10 21.5523 9.55228 22 9 22H3C2.44772 22 2 21.5523 2 21Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path
          fill="#FDD17B"
          d="M14 21C14 20.4477 14.4477 20 15 20H21C21.5523 20 22 20.4477 22 21C22 21.5523 21.5523 22 21 22H15C14.4477 22 14 21.5523 14 21Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path
          fill="#FDD17B"
          d="M10 7H4V3C4 2.45 4.45 2 5 2H9C9.55 2 10 2.45 10 3V7Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path
          fill="#FDD17B"
          d="M14 7H20V3C20 2.45 19.55 2 19 2H15C14.45 2 14 2.45 14 3V7Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path fill="#FDD17B" d="M10 9H14V12H10V9Z" clipRule="evenodd" fillRule="evenodd"></path>
        <path
          fill="#3913B8"
          d="M9.5 19H2.5C2.22 19 2 18.78 2 18.5V7.00001L10 7V18.5C10 18.78 9.78 19 9.5 19Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path
          fill="#3913B8"
          d="M14.5 19H21.5C21.78 19 22 18.78 22 18.5V7.00001L14 7V18.5C14 18.78 14.22 19 14.5 19Z"
          clipRule="evenodd"
          fillRule="evenodd"
        ></path>
        <path
          strokeLinejoin="round"
          strokeMiterlimit="10"
          strokeWidth="1"
          stroke="#2D2D2D"
          d="M2 7.00001L10 7"
        ></path>
        <path
          strokeLinejoin="round"
          strokeMiterlimit="10"
          strokeWidth="1"
          stroke="#2D2D2D"
          d="M22 7.00001L14 7"
        ></path>
      </svg>
    </>
  )
}
