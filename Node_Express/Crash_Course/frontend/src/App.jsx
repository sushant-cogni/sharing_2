import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import Movies from './pages/Movies'
import Login from './pages/Login'
import Register from './pages/Register'
import Watchlist from './pages/Watchlist'

export default function App(){
  const [user, setUser] = useState(() => {
    try{
      return JSON.parse(localStorage.getItem('user'))
    }catch(e){
      return null
    }
  })

  useEffect(()=>{
    if(user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  },[user])

  const logout = ()=>{
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <NavBar user={user} onLogout={logout} />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Movies user={user} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/register" element={<Register onRegister={setUser} />} />
          <Route path="/watchlist" element={user ? <Watchlist user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
