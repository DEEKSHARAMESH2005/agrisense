import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Order, OrderStatus, CartItem } from '../types';
import { initialProducts, initialOrders, fetchProducts, fetchOrders } from '../constants/mockData';

interface MarketplaceContextType {
  products: Product[];
  orders: Order[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  createOrder: (buyerName: string, buyerPhone: string, deliveryAddress: string, items: CartItem[], totalAmount: number) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const PRODUCTS_KEY = '@agrisense_products';
const ORDERS_KEY = '@agrisense_orders';

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedProds = await AsyncStorage.getItem(PRODUCTS_KEY);
      if (storedProds) {
        setProducts(JSON.parse(storedProds));
      } else {
        const fetchedProds = await fetchProducts();
        setProducts(fetchedProds);
      }
      const storedOrders = await AsyncStorage.getItem(ORDERS_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        const fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      }
    } catch (e) {
      console.warn('Failed to load marketplace storage', e);
    }
  };

  const addProduct = async (prod: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...prod,
      id: `prod_${Date.now()}`,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  };

  const updateProduct = async (prod: Product) => {
    const updated = products.map((p) => (p.id === prod.id ? prod : p));
    setProducts(updated);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  };

  const deleteProduct = async (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  };

  const createOrder = (
    buyerName: string,
    buyerPhone: string,
    deliveryAddress: string,
    items: CartItem[],
    totalAmount: number
  ): Order => {
    const newOrder: Order = {
      id: `AGRI-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerName,
      buyerPhone,
      items,
      totalAmount,
      status: 'pending',
      orderDate: new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      deliveryAddress,
      pickupAddress: items[0]?.product.location || 'AgriSense Farm Hub, Nashik',
      pickupCoords: { latitude: 20.005, longitude: 73.78 },
      deliveryCoords: { latitude: 18.5204, longitude: 73.8567 },
      estimatedDelivery: 'Estimated: 2 business days (Demo Flow)',
      deliveryRider: {
        name: 'Suresh Patil',
        phone: '+91 99223 34455',
        vehicle: 'AgriSense Eco Delivery Van',
      },
      isDemo: true,
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  };

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id === orderId);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        orders,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        getOrderById,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
