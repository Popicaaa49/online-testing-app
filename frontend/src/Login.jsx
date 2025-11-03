import React, { useState } from 'react'
import { login } from './api'

export default function Login({ onLogin }){
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
      onLogin()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: 24 }}>
      <h3>Login</h3>
      <label>Username</label>
      <input value={username} onChange={e=>setUsername(e.target.value)} />
      <label>Password</label>
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  )
}
