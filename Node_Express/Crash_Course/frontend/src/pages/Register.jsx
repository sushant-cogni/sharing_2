import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../api'

export default function Register({ onRegister }){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState(null)
  const navigate = useNavigate()

  const submit = async(e)=>{
    e.preventDefault()
    setError(null)
    try{
      const res = await register(name,email,password)
      // After register the API returns created user
      if(res){
        onRegister(res)
      }
      navigate('/')
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3>Register</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input className="form-control" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary">Register</button>
        </form>
      </div>
    </div>
  )
}
