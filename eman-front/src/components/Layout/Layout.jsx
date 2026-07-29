import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CartDrawer from '../CartDrawer/CartDrawer'
import MaintenancePage from '../../pages/MaintenancePage/MaintenancePage'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import styles from './Layout.module.css'

const RUTAS_EXENTAS = ['/login', '/register']

const Layout = () => {
    const location = useLocation()
    const { maintenanceMode } = useSelector(s => s.siteSettings)
    const hideFloatingWhatsapp = location.pathname.startsWith('/checkout') || location.pathname.startsWith('/order-confirm')

    const bloqueado = maintenanceMode && !RUTAS_EXENTAS.includes(location.pathname)

    if (bloqueado) {
        return (
            <>
                <MaintenancePage />
                <WhatsAppButton />
            </>
        )
    }

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