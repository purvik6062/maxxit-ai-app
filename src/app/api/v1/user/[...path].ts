import { NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnect";
import { signUp, login, buyMembership } from "@/Api/Controllers/authController";

export async function POST(request: Request) {
  await dbConnect();

  const { pathname } = new URL(request.url);
  const body = await request.json();

  try {
    switch (pathname) {
      case "/api/v1/user/signup":
        return await signUp(body);
      case "/api/v1/user/login":
        return await login(body);
      case "/api/v1/user/buy-membership":
        return await buyMembership(body);
      default:
        return NextResponse.json({ error: "Route not found" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
