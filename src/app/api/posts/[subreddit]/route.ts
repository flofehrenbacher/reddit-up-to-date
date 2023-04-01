import { redditClient } from '@/app/api-client'
import { Link, Listing, listingSchema } from '@/app/model/reddit'
import { convertMarkdownToHtml } from '@/app/utils/convert-markdown-to-html'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { subreddit: string } }) {
  const { searchParams } = new URL(request.url)
  const before = searchParams.get('before')
  const after = searchParams.get('after')

  const urlSearchParams = new URLSearchParams()
  urlSearchParams.set('limit', '3')

  if (typeof before === 'string') {
    urlSearchParams.set('before', before)
  } else if (typeof after === 'string') {
    urlSearchParams.set('after', after)
  }

  try {
    const beforeOrAfterData = await redditClient(
      `/r/${params.subreddit}/new.json?${urlSearchParams.toString()}`,
    )
    const beforeOrAfterListing = listingSchema.parse(beforeOrAfterData.data)

    if (after) {
      return NextResponse.json(beforeOrAfterListing)
    }

    if (beforeOrAfterListing.data.children.length === 0) {
      return NextResponse.json([])
    }

    const newData = await redditClient(`/r/${params.subreddit}/new.json?limit=3`)
    const newListing = listingSchema.parse(newData.data)

    const listing =
      firstLink(beforeOrAfterListing)?.data.name === firstLink(newListing)?.data.name
        ? beforeOrAfterListing
        : newListing

    const listingChildrenWithHtml = await Promise.all(
      listing.data.children.map(async (child) => ({
        ...child,
        data: { ...child.data, selftext: await convertMarkdownToHtml(child.data.selftext) },
      })),
    )

    return NextResponse.json(listingChildrenWithHtml)
  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}

function firstLink(listing: Listing): Link | undefined {
  return listing.data.children.at(0)
}
