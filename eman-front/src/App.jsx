import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Layout from './components/Layout/Layout'
import Nosotros from './pages/Nosotros/Nosotros'

function App() {
  

  return (
    <>
    <BrowserRouter>
      <Layout> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
      </Routes>
      </Layout>
    </BrowserRouter>
      
    </>
  )
}

export default App
