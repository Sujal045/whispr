import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/model/User";
import * as z from "zod";
import { usernameValidation } from "@/src/schemas/signUpSchema";


const usernameQuerySchema = z.object({
    username: usernameValidation,
})

export async function GET (request: Request) {
    await dbConnect()
    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        const result = usernameQuerySchema.safeParse(queryParam)

        if (!result.success) {
            const errors = z.treeifyError(result.error);
            const userNameErrors = errors.properties?.username?.errors;
            return Response.json({
                success: false,
                message: userNameErrors
            },{status: 400})
        }

        const { username } = result.data

        const existingVerifedUser = await UserModel.findOne({username, isVerified: true})

        if (existingVerifedUser) {
            return Response.json({
                success: false,
                message: 'Username is already taken'
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: 'Username is available'
        }, {status: 200})
    } catch (error) {
        console.log("Error checking username", error)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            { status: 500 }
        )
    }
}
