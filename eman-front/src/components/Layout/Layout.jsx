import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CartDrawer from '../CartDrawer/CartDrawer'

const Layout = ({ children }) => {
    return (
        <>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <CartDrawer/>
        </>
    )
}

export default Layout