import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Layout from './components/Layout/Layout'
import Nosotros from './pages/Nosotros/Nosotros'
import CategoryPage from './pages/CategoryPage/CategoryPage'

function App() {
  

  return (
    <>
    
      <Layout> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/:categoria" element={<CategoryPage />} />
        <Route path="/:categoria" element={<CategoryPage />} />
        <Route path="/:categoria" element={<CategoryPage />} />
      </Routes>
      </Layout>
      
    </>
  )
}

export default App
