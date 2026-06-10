import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Layout from './components/Layout/Layout'
import Nosotros from './pages/Nosotros/Nosotros'
import ProductDetail from './components/ProductDetail/ProductDetail'
import CategoryPage from './pages/CategoryPage/CategoryPage'
import CheckoutPage from './pages/CheckoutPage/CheckoutPage'

function App() {
  

  return (
    <>
    
      <Layout> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/:categoria" element={<CategoryPage />} />
        
      </Routes>
      </Layout>
      
    </>
  )
}

export default App
