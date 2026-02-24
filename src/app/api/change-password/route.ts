import { getServerSession, User } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/options"
import dbConnect from "@/src/lib/dbConnect"
import UserModel from "@/src/model/User"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const sessionUser: User = session?.user as User

    if (!session || !sessionUser) {
        return NextResponse.json(
            { success: false, message: "Not authenticated" },
            { status: 401 }
        )
    }

    try {
        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { success: false, message: "Current and new password are required" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { success: false, message: "New password must be at least 6 characters" },
                { status: 400 }
            )
        }

        const user = await UserModel.findById(sessionUser._id)

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password)

        if (!isCurrentPasswordCorrect) {
            return NextResponse.json(
                { success: false, message: "Current password is incorrect" },
                { status: 400 }
            )
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedNewPassword
        await user.save()

        return NextResponse.json(
            { success: true, message: "Password updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error changing password:", error)
        return NextResponse.json(
            { success: false, message: "Error updating password" },
            { status: 500 }
        )
    }
}
