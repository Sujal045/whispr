import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import { Message } from "@/src/model/User";
import { messageSchema } from "@/src/schemas/messageSchema";
import { usernameValidation } from "@/src/schemas/signUpSchema";
import { messageRateLimiter } from "@/src/lib/rate-limit";

const sendMessageSchema = messageSchema.extend({
    username: usernameValidation,
});

export async function POST (request: Request) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await messageRateLimiter.limit(ip);

    if (!success) {
        return Response.json(
            {
                success: false,
                message: "Rate limit exceeded. Please try again later."
            },
            { status: 429 }
        )
    }

    let requestBody: unknown
    try {
        requestBody = await request.json()
    } catch {
        return Response.json(
            {
                success: false,
                message: "Invalid request body"
            },
            { status: 400 }
        )
    }

    const validationResult = sendMessageSchema.safeParse(requestBody)

    if (!validationResult.success) {
        return Response.json(
            {
                success: false,
                message: validationResult.error.issues[0]?.message ?? "Invalid request data"
            },
            { status: 400 }
        )
    }

    await dbConnect()

    const { username, content } = validationResult.data

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
    } catch {
        return Response.json(
            {
                success: false,
                message: "Internal server error"
            },
            { status: 500 }
        )
    }
}
