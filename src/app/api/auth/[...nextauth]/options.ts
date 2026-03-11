import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import GoogleProvider from "next-auth/providers/google";


export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
              },
              async authorize(credentials: any): Promise<any> {
                await dbConnect()
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            {email: credentials.identifier},
                            {username: credentials.identifier}
                        ]
                    })
                    if (!user) {
                        throw new Error("No user found with this email/username")
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account first")
                    }
                    if (!user.password) {
                        throw new Error("Please log in with Google")
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    } else{
                        throw new Error("Incorrect")
                    }
                } catch (err: any) {
                    throw new Error(err)
                }
              }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                await dbConnect();
                try {
                    const existingUser = await UserModel.findOne({ email: user.email });
                    if (!existingUser) {
                        const newUser = new UserModel({
                            email: user.email,
                            username: user.email?.split('@')[0] || `user${Date.now()}`,
                            isVerified: true,
                            isAcceptingMessage: true,
                            role: 'user',
                            message: []
                        });
                        await newUser.save();
                        user._id = newUser._id?.toString();
                        user.username = newUser.username;
                        user.isVerified = newUser.isVerified;
                        user.isAcceptingMessage = true;
                        user.role = 'user';
                        return true;
                    } else {
                        user._id = existingUser._id?.toString();
                        user.username = existingUser.username;
                        user.isVerified = existingUser.isVerified;
                        user.isAcceptingMessage = existingUser.isAcceptingMessage;
                        user.role = existingUser.role;
                        return true;
                    }
                } catch (error) {
                    console.error("Error creating Google user:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessage = user.isAcceptingMessage
                token.username = user.username
                token.role = user.role
            }
            // If the token lacks NextAuth specific custom fields during consecutive requests, we'd ideally load them from the user object here, but since the sign-in callback directly adds to the `user` object above, it flows into `jwt` correctly.

            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id as string
                session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessage = token.isAcceptingMessage as boolean;
                session.user.username = token.username as string;
                session.user.role = token.role as 'user' | 'admin'
            }
            return session
        }
    },
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}
