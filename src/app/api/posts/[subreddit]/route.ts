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

    const newData = await redditClient(`/r/${params.subreddit}/new.json?limit=3`)
    const newListing = listingSchema.parse(newData.data)

    const firstLinkBeforeOrAfter = firstLink(beforeOrAfterListing)
    const firstLinkNew = firstLink(newListing)

    const listing =
      Boolean(before) &&
      firstLinkNew &&
      firstLinkBeforeOrAfter &&
      firstLinkNew.data.created_utc > firstLinkBeforeOrAfter.data.created_utc
        ? newListing
        : beforeOrAfterListing

    const listingChildrenWithHtml = await getListingWithHTML(listing)

    return NextResponse.json(listingChildrenWithHtml)
  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}

function firstLink(listing: Listing): Link | undefined {
  return listing.data.children.at(0)
}

async function getListingWithHTML(listing: Listing) {
  return await Promise.all(
    listing.data.children.map(async (child) => ({
      ...child,
      data: { ...child.data, selftext: await convertMarkdownToHtml(child.data.selftext) },
    })),
  )
}
