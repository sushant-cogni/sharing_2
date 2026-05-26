import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login({ onLogin }){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  const navigate = useNavigate()

  const submit = async(e)=>{
    e.preventDefault()
    setError(null)
    try{
      const res = await login(email,password)
      // res: {status,data,token}
      const { data, token } = res
      if(token){
        localStorage.setItem('token', token)
      }
      if(data) onLogin(data)
      navigate('/')
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  )
}
