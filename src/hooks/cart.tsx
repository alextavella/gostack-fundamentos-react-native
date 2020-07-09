import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

export interface Product {
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

const KEY_STORAGE = '@GoMarketing/cart';

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // useEffect(() => {
  //   AsyncStorage.removeItem(KEY_STORAGE);
  // }, []);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const localData = await AsyncStorage.getItem(KEY_STORAGE);

      if (localData) {
        const products = JSON.parse(localData) as Product[];
        setProducts(products);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const cartItem = products.find(p => p.id === product.id);

      if (cartItem) {
        cartItem.quantity += 1;
        setProducts([...products]);

        await AsyncStorage.setItem(KEY_STORAGE, JSON.stringify(products));
      } else {
        const item = {
          ...product,
          quantity: 1,
        };

        const added = [...products, item];
        setProducts(added);

        await AsyncStorage.setItem(KEY_STORAGE, JSON.stringify(added));
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const product = products.find(p => p.id === id);

      if (product) {
        product.quantity += 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(KEY_STORAGE, JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(p => p.id === id);

      if (product) {
        product.quantity -= 1;

        if (product.quantity === 0) {
          setProducts(state => state.filter(p => p.id !== id));
        } else {
          setProducts([...products]);
        }
      }

      await AsyncStorage.setItem(KEY_STORAGE, JSON.stringify(products));
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
