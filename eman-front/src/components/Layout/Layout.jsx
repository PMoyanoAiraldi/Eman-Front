import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CartDrawer from '../CartDrawer/CartDrawer'
import { Outlet } from 'react-router-dom'

const Layout = () => {
    return (
        <>
        <Navbar />
        <Outlet/>
        <Footer />
        <WhatsAppButton />
        <CartDrawer/>
        </>
    )
}

export default Layout