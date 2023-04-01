import { redditClient } from '@/app/api-client'
import { listingSchema } from '@/app/model/reddit'
import { convertMarkdownToHtml } from '@/app/utils/convert-markdown-to-html'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { subreddit: string } }) {
  const { searchParams } = new URL(request.url)
  const before = searchParams.get('before')
  const after = searchParams.get('after')

  const urlSearchParams = new URLSearchParams()
  if (typeof before === 'string') {
    urlSearchParams.set('before', before)
  } else if (typeof after === 'string') {
    urlSearchParams.set('after', after)
  }

  try {
    const data = await redditClient(
      `/r/${params.subreddit}/new.json?${urlSearchParams.toString()}&limit=${3}`,
    )

    const listing = listingSchema.parse(data.data)
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
