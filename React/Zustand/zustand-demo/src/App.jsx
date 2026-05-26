import './App.css'
import Counter from './components/Counter'
import Navbar from './components/Navbar'
import Login from './components/Login'
import { useThemeStore } from './contexts/store';
// import { useSelector } from 'react-redux'

function App() {

  const Theme = useThemeStore();

  return (
      <div style={{backgroundColor: Theme.theme}}>
      {/* <div> */}
        <Navbar/>
        <Login/>
        <Counter/>
      </div>
  )
}

export default App
