import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'

const Layout = ({ children }) => {
    return (
        <>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        </>
    )
}

export default Layout