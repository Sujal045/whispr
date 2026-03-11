import mongoose, { Document, mongo, Schema } from 'mongoose';


export interface Message extends Document {
    _id: string;
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now }
})

export interface User extends Document {
    username: string;
    email: string;
    password?: string;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    message: Message [];
    role: 'user' | 'admin';
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please use a valid email address'] },
    password: { type: String },
    verifyCode: { type: String },
    verifyCodeExpiry: { type: Date },
    isVerified: { type: Boolean, required: true },
    isAcceptingMessage: { type: Boolean, required: true, default: true },
    message: [MessageSchema],
    role: { type: String, enum: ["user", "admin"], default: "user" },
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel;
