import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
        <button className='btn btn-danger' onClick={() => setCount((count:number) => count + 1)}>
          count is {count}
        </button>
    </>
  )
}

export default App
