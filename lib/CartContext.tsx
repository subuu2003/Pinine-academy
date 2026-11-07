'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import apiClient from './apiClient';
import { useAuth } from './AuthContext';

export interface CartBookItem {
  book_id: number;
  title: string;
  price: number;
  category?: string;
  subject?: string;
  image_url: string;
  quantity: number;
  stock_quantity?: number;
  inStock?: boolean;
}

interface CartContextType {
  items: CartBookItem[];
  itemCount: number;
  subtotal: number;
  shippingCharges: number;
  grandTotal: number;
  isLoading: boolean;
  addToCart: (
    book: {
      id: number | string;
      title: string;
      price: number;
      category?: string;
      subject?: string;
      image_url?: string;
      inStock?: boolean;
      stock_quantity?: number;
    },
    quantity?: number
  ) => Promise<boolean>;
  updateQuantity: (bookId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (bookId: number) => Promise<boolean>;
  clearCart: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pinine_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartBookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Persist to LocalStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Silently catch quota exceptions
      }
    }
  }, [items, isLoading]);

  // 3. Synchronize with Backend Cart if user is authenticated
  const syncWithBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      // If we have local items, push them to backend
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const localItems: CartBookItem[] = stored ? JSON.parse(stored) : [];

      if (localItems.length > 0) {
        await apiClient.post('/cart/sync/', {
          items: localItems.map(item => ({ book_id: item.book_id, quantity: item.quantity }))
        });
      }

      // Fetch authoritative backend cart
      const res = await apiClient.get('/cart/');
      if (res.data?.data?.items) {
        const backendItems: CartBookItem[] = res.data.data.items.map((it: any) => ({
          book_id: it.book_id,
          title: it.book_title,
          price: it.book_price,
          category: it.book_category,
          subject: it.book_subject,
          image_url: it.book_image_url,
          quantity: it.quantity,
          stock_quantity: it.book_available_stock,
          inStock: it.book_in_stock,
        }));
        setItems(backendItems);
      }
    } catch (err) {
      // Silently catch sync error, fallback to local state
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // Derived financials
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCharges = items.length === 0 ? 0 : subtotal >= 999 ? 0 : 49;
  const grandTotal = Math.round((subtotal + shippingCharges) * 100) / 100;

  // Add Book to Cart
  const addToCart = async (
    book: {
      id: number | string;
      title: string;
      price: number;
      category?: string;
      subject?: string;
      image_url?: string;
      inStock?: boolean;
      stock_quantity?: number;
    },
    quantity: number = 1
  ): Promise<boolean> => {
    const bookId = typeof book.id === 'string' ? parseInt(book.id, 10) : book.id;
    if (isNaN(bookId)) {
      toast.error('Invalid book ID');
      return false;
    }

    if (book.inStock === false || (book.stock_quantity !== undefined && book.stock_quantity <= 0)) {
      toast.error(`'${book.title}' is currently out of stock.`);
      return false;
    }

    // Check existing item
    const existingIndex = items.findIndex(it => it.book_id === bookId);
    let newItems = [...items];

    if (existingIndex > -1) {
      const currentQty = newItems[existingIndex].quantity;
      const maxAvailable = book.stock_quantity ?? 50;
      if (currentQty + quantity > maxAvailable) {
        toast.error(`Only ${maxAvailable} copies available in stock.`);
        return false;
      }
      newItems[existingIndex].quantity += quantity;
    } else {
      newItems.push({
        book_id: bookId,
        title: book.title,
        price: Number(book.price),
        category: book.category || 'General',
        subject: book.subject || 'Publication',
        image_url: book.image_url || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=300&h=400&fit=crop',
        quantity,
        stock_quantity: book.stock_quantity ?? 50,
        inStock: book.inStock ?? true,
      });
    }

    setItems(newItems);
    toast.success(`Added "${book.title}" to cart!`, {
      description: `Cart total: ${newItems.reduce((s, i) => s + i.quantity, 0)} items`,
    });

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await apiClient.post('/cart/add/', { book_id: bookId, quantity });
      } catch (err: any) {
        // Backend failure will notify user if out of stock
        const msg = err.response?.data?.message;
        if (msg) toast.error(msg);
      }
    }

    return true;
  };

  // Update Item Quantity
  const updateQuantity = async (bookId: number, quantity: number): Promise<boolean> => {
    if (quantity <= 0) {
      return removeFromCart(bookId);
    }

    const item = items.find(it => it.book_id === bookId);
    if (!item) return false;

    if (item.stock_quantity && quantity > item.stock_quantity) {
      toast.error(`Only ${item.stock_quantity} copies available in stock.`);
      return false;
    }

    const newItems = items.map(it =>
      it.book_id === bookId ? { ...it, quantity } : it
    );
    setItems(newItems);

    if (isAuthenticated) {
      try {
        await apiClient.post('/cart/update/', { book_id: bookId, quantity });
      } catch (err: any) {
        const msg = err.response?.data?.message;
        if (msg) toast.error(msg);
      }
    }

    return true;
  };

  // Remove Item from Cart
  const removeFromCart = async (bookId: number): Promise<boolean> => {
    const item = items.find(it => it.book_id === bookId);
    const newItems = items.filter(it => it.book_id !== bookId);
    setItems(newItems);

    if (item) {
      toast.info(`Removed "${item.title}" from cart.`);
    }

    if (isAuthenticated) {
      try {
        await apiClient.post('/cart/remove/', { book_id: bookId });
      } catch {
        // Silently catch
      }
    }

    return true;
  };

  // Clear Entire Cart
  const clearCart = async (): Promise<void> => {
    setItems([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    if (isAuthenticated) {
      try {
        await apiClient.post('/cart/clear/');
      } catch {
        // Silently catch
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingCharges,
        grandTotal,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        syncWithBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
