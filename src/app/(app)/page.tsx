'use client'

import React from 'react'
import Carousel from '@/src/components/ui/Carousel'
import messages from '@/src/messages.json'
import { Mail, MessageSquare, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { User } from 'next-auth'

const Home = () => {
  const { data: session, status } = useSession()
  const user = session?.user as User | undefined
  const isAuthenticated = status === 'authenticated' && !!user
  const isLoadingSession = status === 'loading'

  return (
    <div className="min-h-screen bg-white text-black">

      {/* Hero Section */}
      <section className="py-24 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 text-gray-500 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            {isAuthenticated ? 'Your anonymous inbox is live' : 'Anonymous Messaging Platform'}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-black mb-6 leading-tight tracking-tight">
            {isAuthenticated ? (
              <>
                Welcome back,<br />
                <span className="text-gray-400">{user.username || 'Whyspr user'}</span>
              </>
            ) : (
              <>
                Send &amp; Receive<br />
                <span className="text-gray-400">Whyspr</span>
              </>
            )}
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            {isAuthenticated
              ? 'Check your latest messages, update your profile, or share your public link to receive more anonymous notes.'
              : 'Share your thoughts anonymously. Connect with others without revealing your identity. Experience the thrill of mystery messaging.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoadingSession ? (
              <>
                <div className="px-8 py-3 bg-black text-white font-semibold rounded-full opacity-80">
                  Loading your space...
                </div>
                <div className="px-8 py-3 border border-black text-black font-semibold rounded-full opacity-60">
                  Just a moment
                </div>
              </>
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="cursor-pointer px-8 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                >
                  Open Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="cursor-pointer px-8 py-3 border border-black text-black font-semibold rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  View Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="cursor-pointer px-8 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-sm"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/sign-in"
                  className="cursor-pointer px-8 py-3 border border-black text-black font-semibold rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Message Carousel Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-3">
            What People Are Saying
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Real messages from our community. All completely anonymous.
          </p>

          <Carousel autoplay={true} autoplayInterval={4000}>
            {messages.map((message, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      {message.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-3">
                      &quot;{message.content}&quot;
                    </p>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">
                      {message.received}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-14">
            Why Choose Whyspr?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-black hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                100% Anonymous
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Your identity is always protected. Send and receive messages without revealing who you are.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-black hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Real-time Messages
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Receive messages instantly. Get notified the moment someone sends you a mystery message.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-gray-200 hover:border-black hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                AI Suggestions
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Stuck on what to say? Our AI helps you craft the perfect anonymous message every time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            {isAuthenticated ? 'Keep the conversation going' : 'Ready to Get Started?'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isAuthenticated
              ? 'Your account is ready. Jump back in, manage your inbox, or share your personal message link.'
              : 'Join thousands of users already sending and receiving mystery messages.'}
          </p>
          {isLoadingSession ? (
            <div className="inline-block px-10 py-3.5 bg-black text-white font-semibold rounded-full opacity-80">
              Loading...
            </div>
          ) : isAuthenticated ? (
            <Link
              href={user?.username ? `/u/${user.username}` : '/dashboard'}
              className="cursor-pointer inline-block px-10 py-3.5 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              View Your Public Page
            </Link>
          ) : (
            <Link
              href="/sign-up"
              className="cursor-pointer inline-block px-10 py-3.5 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200 shadow-sm"
            >
              Create Your Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2026 Whyspr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home
