// Mismo criterio que products.service.ts -> publish()
export function getMissingFields(product) {
    const missing = []

    if (!product.images || product.images.length === 0) missing.push('imagen')

    const hasStock = product.variants?.some(v => v.stock > 0)
    if (!product.variants || product.variants.length === 0) {
        missing.push('variantes (talle/color)')
    } else if (!hasStock) {
        missing.push('stock')
    }

    if (!product.price || Number(product.price) <= 0) missing.push('precio')

    return missing
}