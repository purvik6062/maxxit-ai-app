import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tweet_link, user_handle } = await request.json();

    // Call TweetScout API to verify retweet
    const response = await fetch('https://api.tweetscout.io/v2/check-retweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ApiKey': process.env.TWEETSCOUT_API_KEY || '',
      },
      body: JSON.stringify({
        tweet_link,
        user_handle,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to verify retweet' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error verifying retweet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 