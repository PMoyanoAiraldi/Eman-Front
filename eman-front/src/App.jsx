import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authService } from './api/authService';
import { setToken, setCredentials } from './redux/slices/authReducer';
import Home from './pages/Home/Home'
import Layout from './components/Layout/Layout'
import Contact from './pages/Contact/Contact';
import ProductDetail from './components/ProductDetail/ProductDetail'
import CategoryPage from './pages/CategoryPage/CategoryPage'
import CheckoutPage from './pages/CheckoutPage/CheckoutPage'
import LoginPage from './pages/Auth/Login/Login';
import RegisterPage from './pages/Auth/Register/Register';
import ProtectedRoute from '../src/components/ProtectedRoute/ProtectedRoute'
import ProfilePage from './pages/Profile/Profile'
import AdminLayout from './pages/Admin/AdminLayout'
import Products from './pages/Admin/sections/Products';
import Orders from './pages/Admin/sections/Orders';
import Users from './pages/Admin/sections/Users'
import EditProduct from './pages/Admin/sections/EditProducts/EditProducts';
import Shipping from './pages/Shipping/Shipping';
import Returns from './pages/Returns/Returns';
import Privacy from './pages/Privacy/Privacy';
import Terms from './pages/Terms/Terms';
import OrderPending from './pages/OrderPending/OrderPending';
import OrderConfirm from './pages/OrderConfirm/OrderConfirm';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
        // Intenta renovar el token al cargar la app
        // Si no hay cookie válida, falla silenciosamente
        authService.refreshToken()
            .then(({ accessToken }) => {
              if (savedUser) { // Si hay user guardado, restauramos la sesión completa
                dispatch(setCredentials({
                    user: JSON.parse(savedUser),
                    accessToken,
                }))
            }else {
                dispatch(setToken(accessToken))
            }
        })
          .catch(() => {
            localStorage.removeItem('user')
        })
    }, [])

  return (
    <>
    
      <Routes>
      <Route element={<Layout/>}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/shipping" element={<Shipping/>}/>
        <Route path="/returns" element={<Returns/>}/>
        <Route path="/privacy" element={<Privacy/>}/>
        <Route path="/terms" element={<Terms/>}/>
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-pending" element={<OrderPending />} />
        <Route path="/order-confirm" element={<OrderConfirm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/perfil" element={
              <ProtectedRoute>
                  <ProfilePage />
              </ProtectedRoute>
          } />
        <Route path="/:categoria" element={<CategoryPage />} />
      </Route>
      <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
              <AdminLayout />
          </ProtectedRoute>
        }>
        <Route index element={<Navigate to="/admin/products" replace />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="users" element={<Users />} /> 
        <Route path="products/:id/edit" element={<EditProduct/>} />
      </Route> 
      
      </Routes>
    </>
  )
}

export default App
