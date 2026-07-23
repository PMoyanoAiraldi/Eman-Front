import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CartDrawer from '../CartDrawer/CartDrawer'
import { Outlet, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

const Layout = () => {
    const location = useLocation()
    const hideFloatingWhatsapp = location.pathname.startsWith('/checkout') || location.pathname.startsWith('/order-confirm')


    return (
        <div className={styles.wrapper}>
        <Navbar />
        <main className={styles.main}>
        <Outlet/>
        </main>
        <Footer />
        {!hideFloatingWhatsapp && <WhatsAppButton />}
        <CartDrawer/>
        </div>
    )
}

export default Layout