import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { displayName } = body;

    if (!displayName || typeof displayName !== "string" || displayName.trim().length === 0) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.displayName = displayName.trim();
    await user.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      displayName: user.displayName,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
