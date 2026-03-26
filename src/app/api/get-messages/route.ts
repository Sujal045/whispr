import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import mongoose from "mongoose";


export async function GET (request: Request) {
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

    const userId = new mongoose.Types.ObjectId(user._id)

    try {
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },
            {
              $project: {
                message: {
                  $sortArray: {
                    input: "$message",
                    sortBy: { createdAt: -1 }
                  }
                }
              }
            }
          ])

        if(!user || user.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 401 }
            )
        }
        return Response.json(
            {
                success: true,
                messages: user[0].message
            },
            { status: 200 }
        )
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Unexpected error occured"
            },
            { status: 500 }
        )
    }
}
