import React, { useEffect, useState } from 'react'
import Login from './Login'
import ProtectedEditor from './ProtectedEditor'
import { me } from './api'

export default function App(){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { me().then(setUser).finally(() => setLoading(false)) }, [])

  if (loading) return <p>Loading...</p>
  if (!user?.authenticated) return <Login onLogin={() => me().then(setUser)} />
  return <ProtectedEditor user={user} />
}
