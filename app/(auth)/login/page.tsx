

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FaGithub } from "react-icons/fa";
import React from 'react'
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const LoginPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>
          Welcome back!
        </CardTitle>
        <CardDescription>
          Login with your Github or email account
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <Button className='w-full' variant='outline'>
          <FaGithub className='size-4 mr-2'/>
          Sign in with Github
        </Button>

        <div className='relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border'>
          <span className='relative z-10 bg-card px-2 text-muted-foreground'>Or continue with</span>
        </div>

        <div className='grid gap-3'>
          <div className='grid gap-2'>
            <Label htmlFor="email">Email</Label>
            <Input 
              type='email' 
              placeholder='your@email.com' 
            />
          </div>

          <Button>
            Continue with Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginPage