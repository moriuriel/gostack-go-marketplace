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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const response = await AsyncStorage.getItem('@GoMarketplace/Products');
      console.log(response);
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const findProductsInCart = products.find(item => item.id === product.id);
      if (findProductsInCart) {
        const productUpdatedQuantity = products.map(item => {
          if (item.id === findProductsInCart.id) {
            item.quantity += 1;
          }
          return item;
        });
        setProducts(productUpdatedQuantity);
        await AsyncStorage.setItem(
          '@GoMarketplace/Products',
          JSON.stringify(productUpdatedQuantity),
        );
        return;
      }

      const cart = [...products, { ...product, quantity: 1 }];
      setProducts(cart);
      await AsyncStorage.setItem(
        '@GoMarketplace/Products',
        JSON.stringify(cart),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProducts = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(incrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace/Products',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products
        .map(product =>
          product.id === id
            ? { ...product, quantity: product.quantity - 1 }
            : product,
        )
        .filter(product => product.quantity > 0);

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProducts),
      );
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
