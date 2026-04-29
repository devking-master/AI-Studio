import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.tier !== "Basic" && user.subscriptionExpiresAt && new Date() > user.subscriptionExpiresAt) {
      user.tier = "Basic";
      user.subscriptionExpiresAt = undefined;
      await user.save();
    }

    return NextResponse.json({
      userId: user._id,
      email: user.email,
      displayName: user.displayName,
      tier: user.tier,
      subscriptionExpiresAt: user.subscriptionExpiresAt,
    });
  } catch (error) {
    console.error("Auth Me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
