import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function GET() {
  return NextResponse.json({ message: 'API route is working' });
}

export async function POST(request: Request) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not defined');
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 500 }
    );
  }

  const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

  try {
    const body = await request.json();
    const { username, otp } = body;

    if (!username || !otp) {
      return NextResponse.json(
        { message: 'Username and OTP are required' },
        { status: 400 }
      );
    }

    try {
      // First get updates to find the chat ID
      const updatesResponse = await fetch(`${TELEGRAM_API}/getUpdates`);
      const updatesData = await updatesResponse.json();

      if (!updatesData.ok) {
        console.error('Failed to get updates:', updatesData);
        return NextResponse.json(
          { message: 'Failed to verify user. Please try again.' },
          { status: 500 }
        );
      }

      // Find the chat ID for the given username
      const userUpdate = updatesData.result.find((update: any) => 
        update.message?.from?.username?.toLowerCase() === username.toLowerCase()
      );

      if (!userUpdate) {
        return NextResponse.json(
          { message: 'Please start a chat with our bot first and try again.' },
          { status: 404 }
        );
      }

      console.log("chattttttttt", userUpdate)
      const chatId = userUpdate.message.chat.id;
      const telegramId = userUpdate.message.from.id; // Get the Telegram user ID

      // Send the OTP message
      const message = `Your OTP for AI Trading Platform verification is: ${otp}`;
      const sendMessageResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });

      const messageData = await sendMessageResponse.json();
      
      if (!messageData.ok) {
        console.error('Telegram API Error:', messageData);
        return NextResponse.json(
          { 
            message: messageData.description || 'Failed to send message. Please make sure you have started a chat with our bot.'
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ 
        message: 'OTP sent successfully',
        chatId: chatId,
        telegramId: telegramId
      });
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return NextResponse.json(
        { message: 'Please make sure you have started a chat with our bot and try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { message: 'Invalid request' },
      { status: 400 }
    );
  }
}