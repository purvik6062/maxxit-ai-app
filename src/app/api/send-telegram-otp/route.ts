import { NextResponse } from 'next/server';
import dbConnect from "src/utils/dbConnect";

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
      // Connect to database
      const client = await dbConnect();
      const db = client.db("ctxbt-signal-flow");
      
      // Query the welcomed_users collection to verify user
      const cleanUsername = username.replace("@", "").toLowerCase();
      const welcomedUser = await db.collection("welcomed_users").findOne({
        username: cleanUsername
      });

      if (!welcomedUser) {
        return NextResponse.json(
          { 
            message: 'Please start a chat with our bot first and send the "start" message. Check step 1 & 2 in the instructions.' 
          },
          { status: 404 }
        );
      }

      // Extract user ID and chat ID from the welcomed user document
      const chatId = welcomedUser.user_id;
      const telegramId = welcomedUser.user_id; 
      console.log(`User verified for OTP: ${cleanUsername} (ID: ${telegramId})`);

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