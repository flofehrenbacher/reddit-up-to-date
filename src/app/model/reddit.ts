export interface Listing {
  kind: 'listing'
  before: string | null
  after: string | null
  // distinct number of children
  dist: number
  children: ListingItem[]
}

const types = {
  t1: 'Comment',
  t2: 'Account',
  t3: 'Link',
  t4: 'Message',
  t5: 'Subreddit',
  t6: 'Award',
}

export type TypeCode = keyof typeof types

type ListingItem = Link

type Link = {
  kind: 't3'
  data: {
    // label (e.g. '❔ Question' or '🔊 New Release')
    link_flair_text?: string
    title: string
    selftext?: string
    ups: number
    downs: number
    // reddit's id for things (referred to as fullname)
    name: string
    url: string
  }
}
