import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authService } from './api/authService';
import { setToken } from './redux/slices/authReducer';
import Home from './pages/Home/Home'
import Layout from './components/Layout/Layout'
import Nosotros from './pages/Nosotros/Nosotros'
import ProductDetail from './components/ProductDetail/ProductDetail'
import CategoryPage from './pages/CategoryPage/CategoryPage'
import CheckoutPage from './pages/CheckoutPage/CheckoutPage'

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
        // Intenta renovar el token al cargar la app
        // Si no hay cookie válida, falla silenciosamente
        authService.refreshToken()
            .then(({ accessToken }) => dispatch(setToken(accessToken)))
            .catch(() => {}); // no hay sesión activa, es normal
    }, []);

  return (
    <>
    
      <Layout> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        {/* <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> */}
        <Route path="/:categoria" element={<CategoryPage />} />
        
      </Routes>
      </Layout>
      
    </>
  )
}

export default App
