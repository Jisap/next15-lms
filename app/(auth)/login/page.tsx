

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

const LoginPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-xl'>
          Welcome back!
        </CardTitle>
        <CardDescription>
          Login with your Github o email account
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

export default LoginPage