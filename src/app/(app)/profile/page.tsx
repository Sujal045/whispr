'use client'

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ApiResponse } from "@/src/types/ApiResponse"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { Eye, EyeOff, KeyRound, Loader2, Mail, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

// Schema for the change-password form
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ChangePasswordData = z.infer<typeof changePasswordSchema>

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState({ username: "", email: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get("/api/user-data")
        setUserInfo({
          username: response.data.username ?? "",
          email: response.data.email ?? "",
        })
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>
        toast.error("Failed to load profile", {
          description:
            axiosError.response?.data.message ?? "Something went wrong",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [])

  const onSubmitPasswordChange = async (data: ChangePasswordData) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>("/api/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success("Password changed", {
        description: response.data.message,
      })
      passwordForm.reset()
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Failed to change password", {
        description:
          axiosError.response?.data.message ?? "Something went wrong",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 dark:bg-gray-950 pt-12 pb-16 px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            My Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View your account details and manage your password.
          </p>
        </div>

        {/* Account Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Account Information
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading your details...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Username
                </label>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {userInfo.username || "—"}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Email
                </label>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {userInfo.email || "—"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Change Password
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Enter your current password to set a new one.
          </p>

          <Separator />

          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)}
              className="space-y-4"
            >
              {/* Current Password */}
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          placeholder="Enter your current password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="At least 6 characters"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter your new password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
