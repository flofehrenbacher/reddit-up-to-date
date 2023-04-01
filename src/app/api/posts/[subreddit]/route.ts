import { redditClient } from '@/app/api-client'
import { listingSchema } from '@/app/model/reddit'
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
    return NextResponse.json(listing.data.children)
  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}
