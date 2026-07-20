import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CartDrawer from '../CartDrawer/CartDrawer'
import { Outlet, useLocation } from 'react-router-dom'

const Layout = () => {
    const location = useLocation()
    const hideFloatingWhatsapp = location.pathname.startsWith('/order-confirm')


    return (
        <>
        <Navbar />
        <Outlet/>
        <Footer />
        {!hideFloatingWhatsapp && <WhatsAppButton />}
        <CartDrawer/>
        </>
    )
}

export default Layout