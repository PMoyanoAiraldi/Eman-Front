import { useRef, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import Toast from "../../components/Toast/Toast";
import { withdrawalService } from "../../api/withdrawalService";
import infoStyles from "../../styles/InfoPage.module.css";
import formStyles from "../Contact/Contact.module.css";

const Withdrawal = () => {
    const form = useRef(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [result, setResult] = useState(null);

    const hideToast = () => setToast(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(form.current);

        // si el honeypot tiene valor, es un bot
        if (data.get("honeypot")) return;

        const orderNumber = data.get("orderNumber").trim();
        const email = data.get("email").trim();
        const note = data.get("note").trim();

        setLoading(true);
        try {
            const res = await withdrawalService.create({
                orderNumber,
                email,
                note: note || undefined,
            });
            setResult({ ...res, email });
        } catch (error) {
            const message = error.response?.data?.message;
            setToast({
                type: "error",
                message: Array.isArray(message)
                    ? message[0]
                    : message || "No pudimos registrar tu solicitud. Intentá nuevamente.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={infoStyles.container}>
                <div className={infoStyles.content}>
                    <Breadcrumb items={[
                        { label: 'Inicio', path: '/' },
                        { label: 'Botón de arrepentimiento' }]}
                    />

                    <h1 className={infoStyles.title}>Botón de arrepentimiento</h1>

                    <div className={infoStyles.card}>
                        {result ? (
                            <section className={infoStyles.section}>
                                <h2 className={infoStyles.subtitle}>
                                    {result.alreadyRequested ? "Ya teníamos tu solicitud" : "Recibimos tu solicitud"}
                                </h2>
                                <p>Tu código de identificación es:</p>
                                <p><strong style={{ fontSize: "1.4rem" }}>{result.code}</strong></p>
                                <p>
                                    {result.alreadyRequested
                                        ? "Ya había una solicitud abierta para este pedido, este es su código. "
                                        : `Te lo enviamos también a ${result.email}. `}
                                    Nos vamos a comunicar con vos para coordinar la devolución. El costo del envío de devolución está a cargo de Eman.
                                </p>
                            </section>
                        ) : (
                            <section className={infoStyles.section}>
                                <p>
                                    Si te arrepentís de tu compra, completá este formulario. Tenés 10 días corridos desde que recibís tu pedido. No hace falta tener cuenta ni indicar un motivo.
                                </p>
                                <form ref={form} onSubmit={handleSubmit} className={formStyles.form}>
                                    <input
                                        className={formStyles.input}
                                        type="text"
                                        name="orderNumber"
                                        aria-label="Número de pedido"
                                        placeholder="Número de pedido (figura en el mail de confirmación)"
                                        required
                                    />
                                    <input
                                        className={formStyles.input}
                                        type="email"
                                        name="email"
                                        aria-label="Email de la compra"
                                        autoComplete="email"
                                        autoCapitalize="none"
                                        placeholder="Email que usaste en la compra"
                                        required
                                    />
                                    <textarea
                                        className={formStyles.input}
                                        name="note"
                                        aria-label="Prendas a devolver"
                                        placeholder="Si querés devolver solo algunas prendas, indicalo acá (opcional)"
                                        maxLength={500}
                                    />
                                    {/* campo invisible para bots */}
                                    <input
                                        type="text"
                                        name="honeypot"
                                        style={{ display: "none" }}
                                        tabIndex={-1}
                                        autoComplete="off"
                                        aria-hidden="true"
                                    />
                                    <button className={formStyles.button} type="submit" disabled={loading}>
                                        {loading ? "Enviando..." : "Arrepentirme de mi compra"}
                                    </button>
                                </form>
                            </section>
                        )}
                    </div>
                </div>
            </div>
            <Toast toast={toast} onHide={hideToast} />
        </>
    );
};

export default Withdrawal;