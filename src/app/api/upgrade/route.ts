import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { tier } = await req.json();

    if (!tier || !["Basic", "Pro", "Pro+", "Premium"].includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    await dbConnect();

    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + 1);

    const user = await User.findByIdAndUpdate(
      session.userId,
      { 
        tier,
        subscriptionExpiresAt: expirationDate
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Successfully upgraded",
      tier: user.tier,
    });
  } catch (error) {
    console.error("Upgrade API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
