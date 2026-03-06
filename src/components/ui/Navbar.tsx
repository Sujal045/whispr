'use client'

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { Button } from '@/components/ui/button'
import { UserCircle } from 'lucide-react'

const Navbar = () => {
  const { data: session } = useSession()
  const user: User = session?.user as User

  return (
    <nav className='border-b border-gray-200 bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-3 flex items-center justify-between'>
        {/* Brand */}
        <Link
          href='/'
          className='text-lg font-bold text-black tracking-tight hover:opacity-70 transition-opacity'
        >
          Mystery Message
        </Link>

        {/* Right side */}
        <div className='flex items-center gap-2'>
          {session ? (
            <>
              <span className='text-sm text-gray-500 hidden sm:block'>
                {user?.username || user?.email}
              </span>

              {/* Profile icon link */}
              <Link href='/profile'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-gray-600 hover:text-black hover:bg-gray-100 cursor-pointer'
                  title='Profile'
                >
                  <UserCircle className='w-5 h-5' />
                </Button>
              </Link>

              <Button
                variant='outline'
                className='cursor-pointer border-black text-black hover:bg-black hover:text-white transition-colors'
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href='/sign-in'>
              <Button className='cursor-pointer bg-black text-white hover:bg-gray-800 transition-colors'>
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
