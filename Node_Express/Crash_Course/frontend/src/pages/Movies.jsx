import React, { useEffect, useState } from 'react'
import { getMovies, addMovie, addToWatchlist } from '../api'

export default function Movies({ user }){
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({title:'', year:'', overview:''})
  const [error, setError] = useState(null)

  const token = localStorage.getItem('token')

  useEffect(()=>{
    load()
  },[])

  async function load(){
    setLoading(true)
    try{
      const res = await getMovies(token)
      setMovies(res.message || [])
    }catch(err){
      setError(err.message)
    }finally{setLoading(false)}
  }

  async function submit(e){
    e.preventDefault()
    if(!user){
      setError('Please login to add movies')
      return
    }
    try{
      const moviePayload = {...form, year: Number(form.year), addedBy: user._id}
      await addMovie(moviePayload, token)
      setForm({title:'', year:'', overview:''})
      load()
    }catch(err){
      setError(err.message)
    }
  }

  async function addToWL(movieId){
    if(!user){ setError('Login to add to watchlist'); return }
    try{
      await addToWatchlist({ user: user._id, movie: movieId }, token)
      alert('Added to watchlist')
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Movies</h3>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          {loading ? <div>Loading...</div> : (
            <div className="row">
              {movies.map(m => (
                <div key={m._id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{m.title} <small className="text-muted">({m.year})</small></h5>
                      <p className="card-text">{m.overview}</p>
                      <button className="btn btn-sm btn-outline-primary" onClick={()=>addToWL(m._id)}>Add to Watchlist</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="col-md-4">
          <h5>Add Movie</h5>
          <form onSubmit={submit}>
            <div className="mb-2">
              <input className="form-control" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            </div>
            <div className="mb-2">
              <input className="form-control" placeholder="Year" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} />
            </div>
            <div className="mb-2">
              <textarea className="form-control" placeholder="Overview" value={form.overview} onChange={e=>setForm({...form,overview:e.target.value})} />
            </div>
            <button className="btn btn-success">Add Movie</button>
          </form>
        </div>
      </div>
    </div>
  )
}
