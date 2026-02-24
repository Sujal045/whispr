import { getServerSession, User } from "next-auth"
import { NextResponse } from "next/server"
import dbConnect from "@/src/lib/dbConnect"
import UserModel from "@/src/model/User"
import { authOptions } from "../auth/[...nextauth]/options"

export async function GET() {
  await dbConnect()
  const session = await getServerSession(authOptions)
  const user: User = session?.user as User

  if (!session || !session.user) {
      return Response.json(
          {
              success: false,
              message: "Not authenticated"
          },
          { status: 401 }
      )
  }
  try {
    const foundUser = await UserModel.findById(user._id)
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found"
        },
        { status: 404 }
      )
    }
    return Response.json(
      {
          success: true,
          username: foundUser?.username,
          email: foundUser?.email
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to fetch user data"
      },
      { status: 500 }
    )
  }
}
