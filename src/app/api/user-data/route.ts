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
  const foundUser = await UserModel.findById(user._id)
  console.log("-------------------------------------------------------")
  console.log(foundUser)
  return Response.json(
    {
        success: true,
        username: foundUser?.username,
        email: foundUser?.email
    },
    { status: 200 }
)

  try {
    const users = await UserModel.find({})
      .select("-password")
      .lean()

    return NextResponse.json({
      success: true,
      users,
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error fetching users" },
      { status: 500 }
    )
  }
}
