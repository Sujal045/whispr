'use client'

import React, { useState } from 'react'
import axios, { AxiosError } from 'axios'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form' 
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ApiResponse } from '@/src/types/ApiResponse'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

// Define validation schema
const messageSchema = z.object({
  content: z.string()
    .min(10, { message: 'Message must be at least 10 characters.' })
    .max(300, { message: 'Message must not be longer than 300 characters.' }),
})

const SendMessagePage = () => {
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isGenerating, setIsGenerating] = useState(false)

    const params = useParams<{ username: string }>()
    const username = params.username

    const form = useForm<z.infer<typeof messageSchema>>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: '',
        },
    })

    const [isLoading, setIsLoading] = useState(false)

    const watchContent = form.watch('content')

    const onSubmit = async (data: z.infer<typeof messageSchema>) => {
        setIsLoading(true)
        try {
            const response = await axios.post<ApiResponse>('/api/send-message', {
                username,
                content: data.content,
            })
            toast.success(response.data.message || "Message sent successfully!")
            form.reset()
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error(axiosError.response?.data.message || "Failed to send message")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerate = async () => {
        setIsGenerating(true)
        setSuggestions([])
        try {
          const response = await fetch('/api/suggest-messages', {
            method: 'POST',
          })
          const data = await response.json()
          setSuggestions(data.questions)
        } catch (error) {
          toast.error("Failed to generate suggestions")
        } finally {
          setIsGenerating(false)
        }
      }

    return (
        <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
            <h1 className="text-4xl font-bold mb-6 text-center">
                Public Profile Link
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                                <FormControl>
                                    <textarea
                                        placeholder="Write your anonymous message here"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-center">
                         {isLoading ? (
                            <Button disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Please wait
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isLoading || !watchContent}>
                                Send It
                            </Button>
                        )}
                    </div>
                </form>
            </Form>

            <div className="text-center mt-8">
                <div className="mb-4">Get Your Message Board</div>
                <Link href={'/sign-up'}>
                    <Button>Create Your Account</Button>
                </Link>
            </div>
            <div className="text-center mt-8">
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Messages"}
                </Button>
            </div>
            {suggestions.length > 0 && (
                <div className="mt-6 space-y-3">
                    {suggestions.map((msg, index) => (
                        <div
                            key={index}
                            className="p-4 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => form.setValue("content", msg)}
                        >
                            {msg}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SendMessagePage
