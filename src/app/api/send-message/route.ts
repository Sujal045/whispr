import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import { Message } from "@/src/model/User";

export async function POST (request: Request) {
    await dbConnect()

    const { username, content } = await request.json()

    try {
        const user = await UserModel.findOne({username})

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            )
        }

        // Is user accepting the messages

        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: "Not accepting the messages"
                },
                { status: 403 }
            )
        }

        const newMessage = { content, createdAt: new Date()}
        user.message.push(newMessage as Message)
        await user.save()
        return Response.json(
            {
                success: true,
                message: "Message sent successfully"
            },
            { status: 200 }
        )
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Internal server error"
            },
            { status: 500 }
        )
    }
}
