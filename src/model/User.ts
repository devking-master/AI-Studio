import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  displayName?: string;
  tier: "Basic" | "Pro" | "Pro+" | "Premium";
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    displayName: {
      type: String,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["Basic", "Pro", "Pro+", "Premium"],
      default: "Basic",
    },
    subscriptionExpiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
