import { dbConnect } from "@/lib/dbConnect";
import { Chat } from "@/model/Chat";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await dbConnect();
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const { messages, title } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await dbConnect();

    const updateData: any = {};
    if (messages) updateData.messages = messages;
    if (title) updateData.title = title;

    const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, {
      new: true,
    });

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error updating chat:", error);
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;
    const { title } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await dbConnect();
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId, 
      { title }, 
      { new: true }
    );

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error("Error renaming chat:", error);
    return NextResponse.json({ error: "Failed to rename chat" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chatId } = await params;

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    await dbConnect();

    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}