import './App.css'
import Counter from './components/Counter'
import Navbar from './components/Navbar'
import Login from './components/Login'
import { useSelector } from 'react-redux'

function App() {

  const {theme} = useSelector(state => state.theme);

  return (
      <div style={{backgroundColor: theme}}>
        <Navbar/>
        <Login/>
        <Counter/>
      </div>
  )
}

export default App
