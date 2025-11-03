import React, { useState } from 'react'
import { createTest } from './api'

export default function ProtectedEditor({ user }){
  const [title, setTitle] = useState('New quiz')
  const [status, setStatus] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('')
    try {
      const r = await createTest({ title })
      setStatus(JSON.stringify(r, null, 2))
    } catch (e) {
      setStatus('ERROR: ' + e.message)
    }
  }

  return (
    <div style={{ margin: 24 }}>
      <p>Signed in as <b>{user.username}</b></p>
      <form onSubmit={submit}>
        <input value={title} onChange={e=>setTitle(e.target.value)} />
        <button type="submit">Create test</button>
      </form>
      {status && <pre>{status}</pre>}
    </div>
  )
}
