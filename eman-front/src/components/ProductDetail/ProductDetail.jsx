import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, clearSelectedProduct } from "../../redux/productsReducer";
import { addItem, openCart } from "../../redux/cartReducer";
import styles from "./ProductDetail.module.css";


export default function ProductDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const { selectedProduct: product, loading, error } = useSelector(
        (state) => state.products
    );
    
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize]   = useState(null);
    const [quantity, setQuantity]           = useState(1);
    const [added, setAdded]                 = useState(false);
    
    useEffect(() => {
        dispatch(fetchProductById(id));
        return () => dispatch(clearSelectedProduct());
    }, [id, dispatch]);



    if (loading) return <div className={styles.status}>Cargando producto...</div>;
    if (error)   return <div className={`${styles.status} ${styles.error}`}>{error}</div>;
    if (!product) return null;
    
    const discount =
        product.originalPrice && product.originalPrice > product.price
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : null;

    // Deriva colores únicos de las variantes
    const colors = product.variants
        ? [...new Map(product.variants.map(v => [v.color.id, v.color])).values()]
        : [];

        console.log("colors", colors)
    // Deriva talles únicos de las variantes
    const sizes = product.variants
        ? [...new Map(product.variants.map(v => [v.size.id, v.size])).values()]
        : [];

        console.log("sizes", sizes)
    const activeColor = selectedColor ?? colors[0] ?? null;

console.log("activeColor", activeColor)
    // Devuelve el stock para la variante seleccionada (color + talle)
    // Estructura esperada: product.variants = [{ colorName, size, stock }]
    const getStock = (size) => {
        if (!selectedColor || !product.variants) return 0;
        const variant = product.variants.find(
        (v) => v.color.id === selectedColor.id && v.size.id === size.id
        );
        return variant?.stock ?? 0;
    };

    const selectedStock = selectedSize ? getStock(selectedSize) : null;

    const stockLabel = () => {
        if (!selectedSize) return { text: "Seleccioná un talle", cls: styles.stockNeutral };
        if (selectedStock === 0)  return { text: "Sin stock",                cls: styles.stockOut  };
        if (selectedStock <= 3)   return { text: `Últimas ${selectedStock} unidades`, cls: styles.stockLow  };
        return { text: `${selectedStock} disponibles`, cls: styles.stockHigh };
    };
    
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setSelectedSize(null); // resetea talle al cambiar color
    };


    const handleAddToCart = () => {
    if (!selectedSize) return;

    dispatch(
        addItem({
            product: {
            id:    product.id,
            name:  product.name,
            price: product.price,
            image: product.images?.[0] ?? null,
            color: activeColor,
            },
            size:     selectedSize.name,
            quantity,
        })
    );
    dispatch(openCart());
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
};

    const { text: stockText, cls: stockCls } = stockLabel();

return (
    <div className={styles.wrapper}>
      {/* ── Galería ── */}
        <div className={styles.gallery}>
            <div className={styles.thumbs}>
            {product.images?.map((img, i) => (
                <button
                key={i}
                className={`${styles.thumb} ${i === activeImageIndex ? styles.thumbActive : ""}`}
                onClick={() => setActiveImageIndex(i)}
                aria-label={`Ver imagen ${i + 1}`}
                >
                <img src={img} alt={`${product.name} vista ${i + 1}`} />
                </button>
            ))}
            </div>
    
            <div className={styles.mainImageWrap}>
            {discount && <span className={styles.badge}>−{discount}%</span>}
            <img
                className={styles.mainImage}
                src={product.images?.[activeImageIndex]}
                alt={product.name}
            />
            </div>
        </div>

        {/* ── Info ── */}
        <div className={styles.info}>
        {product.brand && <p className={styles.brand}>{product.brand}</p>}
        <h1 className={styles.name}>{product.name}</h1>


        {/* Precio */}
        <div className={styles.priceRow}>
            <span className={styles.price}>
                ${Number(product.price).toLocaleString("es-AR")}
            </span>
            {discount && (
                <>
                <span className={styles.priceOld}>
                    ${Number(product.originalPrice).toLocaleString("es-AR")}
                </span>
                <span className={styles.discountBadge}>−{discount}%</span>
                </>
            )}
            </div>

        <hr className={styles.divider} />

        {/* Colores */}
        {colors?.length > 0 && (
            <div className={styles.section}>
                <p className={styles.sectionLabel}>
                Color —{" "}
                <span className={styles.sectionValue}>{activeColor?.name}</span>
                </p>
                <div className={styles.colors}>
                {colors.map((color) => (
                    <button
                    key={color.id}
                    className={`${styles.colorBtn} ${
                        activeColor?.id === color.id ? styles.colorActive : ""
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorSelect(color)}
                    aria-label={color.name}
                    title={color.name}
                    />
                ))}
                </div>
            </div>
        )}

        {/* Talles */}
        {sizes?.length > 0 && (
            <div className={styles.section}>
                <p className={styles.sectionLabel}>Talle</p>
                <div className={styles.sizes}>
                {sizes.map((size) => {
                    const stock = getStock(size);
                    const isOut = stock === 0;
                    return (
                    <button
                        key={size.id}
                        className={`${styles.sizeBtn} ${
                        selectedSize?.id === size.id ? styles.sizeBtnActive : ""
                        } ${isOut ? styles.sizeBtnOut : ""}`}
                        onClick={() => !isOut && setSelectedSize(size)}
                        disabled={isOut}
                        aria-label={`Talle ${size}${isOut ? " sin stock" : ""}`}
                    >
                        {size.name}
                    </button>
                    );
                })}
                </div>
                <div className={`${styles.stock} ${stockCls}`}>
                <span className={styles.stockDot} />
                <span>{stockText}</span>
                </div>
            </div>
        )}

        <hr className={styles.divider} />

        {/* Cantidad */}
        <div className={styles.qtyRow}>
            <p className={styles.sectionLabel}>Cantidad</p>
            <div className={styles.qty}>
                <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Restar cantidad"
                >
                −
                </button>
                <span>{quantity}</span>
                <button
                onClick={() =>
                    setQuantity((q) => Math.min(selectedStock ?? 10, q + 1))
                }
                aria-label="Sumar cantidad"
                >
                +
                </button>
            </div>
            </div>

        {/* Botón agregar */}
        <button
            className={`${styles.addBtn} ${added ? styles.addBtnAdded : ""}`}
            onClick={handleAddToCart}
            disabled={!selectedSize || selectedStock === 0}
            >
            {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
            </button>
    
            <hr className={styles.divider} />
    
            {/* Descripción */}
            {product.description && (
            <div className={styles.section}>
                <p className={styles.sectionLabel}>Descripción</p>
                <p className={styles.description}>{product.description}</p>
            </div>
            )}
        </div>
        </div>
    );
}