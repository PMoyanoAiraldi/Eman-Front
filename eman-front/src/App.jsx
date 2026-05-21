import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Layout from './components/Layout/Layout'
import Nosotros from './pages/Nosotros/Nosotros'

function App() {
  

  return (
    <>
    
      <Layout> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
      </Routes>
      </Layout>
      
    </>
  )
}

export default App
