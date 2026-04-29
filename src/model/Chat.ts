import mongoose, { Schema, Document } from "mongoose";

interface IAttachment {
  url: string;
  type: "image" | "video" | "file";
  name: string;
}

interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: IAttachment[];
}

interface IChat extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    attachments: [
      {
        url: String,
        type: { type: String, enum: ["image", "video", "file"] },
        name: String,
      },
    ],
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: "New Chat",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Chat =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
