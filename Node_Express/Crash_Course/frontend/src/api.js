const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001'

async function apiFetch(path, {method='GET', body, token, headers={}} = {}){
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  if(token) opts.headers['Authorization'] = `Bearer ${token}`
  if(body) opts.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}${path}`, opts)
  const data = await res.json().catch(()=>({}))
  if(!res.ok) throw new Error(data.message || 'API error')
  return data
}

export async function login(email, password){
  const data = await apiFetch('/auth/login', {method:'POST', body:{email,password}})
  return data
}

export async function register(name,email,password){
  const data = await apiFetch('/auth/register', {method:'POST', body:{name,email,password}})
  return data
}

export async function getMovies(token){
  const data = await apiFetch('/movies', {method:'GET', token})
  return data
}

export async function addMovie(movie, token){
  const data = await apiFetch('/movies', {method:'POST', body:movie, token})
  return data
}

export async function addToWatchlist(payload, token){
  const data = await apiFetch('/watchlists', {method:'POST', body:payload, token})
  return data
}

export async function getWatchlist(userId, token){
  const data = await apiFetch(`/watchlists/${userId}`, {method:'GET', token})
  return data
}
