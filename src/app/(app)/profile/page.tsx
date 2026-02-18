'use client'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signUpSchema } from "@/src/schemas/signUpSchema"
import { ApiResponse } from "@/src/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { useDebounceValue } from "usehooks-ts"
import * as z from "zod"


const profile = () => {
    const profileForm = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
          username: '',
          email: '',
          password: ''
        }
      })

    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [debouncedUsername] = useDebounceValue(username, 300)
    const router = useRouter()

    useEffect(() => {
        console.log("TRigggggerreeeddddd")
        const checkUsernameUnique = async () => {
        //   if (debouncedUsername) {
            setIsCheckingUsername(true)
            setUsernameMessage('')
              try {
                const response = await axios.get(`/api/user-data`)
                console.log(response)
                profileForm.reset({
                    username: response.data.username,
                    email: response.data.email
                  })
                setUsernameMessage(response.data.message)
              } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                console.log(axiosError)
                setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
              }
              finally {
                setIsCheckingUsername(false)
              }
        //   }
        }
        checkUsernameUnique()
      }, [])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data)
            toast("This is title", {
              description: response.data.message
            })
            router.replace(`/sign-in`)
            setIsSubmitting(false)
          }
        catch (error) {
          console.error("Error while signup", error)
          const axiosError = error as AxiosError<ApiResponse>;
          let errorMessage = axiosError.response?.data.message
          toast("Signup failed", {
            description: errorMessage,
          })
          setIsSubmitting(false)
        }
      }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
          <div className="w-full max-w-md p-8 space-y-8 bg-rounded-lg shadow-md">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
              Profile Details
            </h1>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Username */}
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            setUsername(e.target.value)
                          }}
                        />
                      </FormControl>
                      {isCheckingUsername ? (
                        <p className="text-sm text-gray-500">
                          Checking availability...
                        </p>
                      ) : (
                        <p className="text-sm">{usernameMessage}</p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Email */}
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
    
                {/* Password */}
                {/* <FormField
                  control={profileForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
    
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      )
}

export default profile
