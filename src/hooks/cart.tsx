import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const list = await AsyncStorage.getItem('@goMarketplace:cart');
      if (list) {
        setProducts([...JSON.parse(list)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const exists = products.find(p => p.id === product.id);
      if (!exists) {
        const listProducts = [...products, { ...product, quantity: 1 }];
        setProducts(listProducts);
        await AsyncStorage.setItem(
          '@goMarketplace:cart',
          JSON.stringify(listProducts),
        );
      } else {
        increment(exists.id);
      }
    },
    [products, increment],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );
      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(product => product.id === id);

      if (product) {
        const newProducts =
          product.quantity > 1
            ? products.map(product =>
                product.id === id
                  ? { ...product, quantity: product.quantity - 1 }
                  : product,
              )
            : products.filter(p => p.id !== product.id);
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
