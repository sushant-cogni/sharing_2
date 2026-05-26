import React, { useEffect, useState } from 'react'
import { getWatchlist } from '../api'

export default function Watchlist({ user }){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const token = localStorage.getItem('token')

  useEffect(()=>{
    load()
  },[])

  async function load(){
    try{
      setLoading(true)
      const res = await getWatchlist(user._id, token)
      setItems(res.watchlist || [])
    }catch(err){
      setError(err.message)
    }finally{setLoading(false)}
  }

  return (
    <div>
      <h3>Your Watchlist</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="list-group">
          {items.map(it => (
            <div key={it._id} className="list-group-item">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{it.movie && it.movie.title ? it.movie.title : 'Movie'}</h5>
                <small>{it.status}</small>
              </div>
              <p className="mb-1">{it.notes}</p>
              <small>Rating: {it.rating || 'N/A'}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
