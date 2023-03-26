import { redditClient } from '@/app/api-client'
import { listingSchema } from '@/app/model/reddit'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { subreddit: string } }) {
  const { searchParams } = new URL(request.url)
  const after = searchParams.get('after')

  const urlSearchParams = new URLSearchParams()
  if (typeof after === 'string') {
    urlSearchParams.set('after', after)
  }

  try {
    const data = await redditClient(`/r/${params.subreddit}/new.json?${urlSearchParams.toString()}`)

    const listing = listingSchema.parse(data.data)
    return NextResponse.json(listing)
  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}
