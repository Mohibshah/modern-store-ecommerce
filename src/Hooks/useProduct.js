import { useMemo } from 'react';

export const useProduct = (products, id) => {
  const numericId = Number(id);

  const product = useMemo(
    () => products.find((item) => item.id === numericId),
    [products, numericId]
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [products, product]);

  return { product, relatedProducts };
};