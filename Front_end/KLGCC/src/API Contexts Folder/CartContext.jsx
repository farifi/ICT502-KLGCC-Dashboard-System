import { createContext, useContext, useState, useCallback } from "react";
import API from "../Api.jsx";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartList, setCartList] = useState([]);
  const [cartWithBookingList, setCartWithBookingList] = useState([]);

  // 1. fetchCartList - For simple dropdowns/references
  const fetchCartList = useCallback(async () => {
    try {
      const res = await API.get("/api/cart/list");
      setCartList(res.data.carts || []);
    } catch (err) {
      console.error("Fetch Cart List Error:", err);
    }
  }, []);

  // 2. fetchCartWithBookingList - The main table data
  const fetchCartWithBookingList = useCallback(async () => {
    try {
      const res = await API.get("/api/cart/listWithBooking");
      setCartWithBookingList([...(res.data.carts || [])]);
    } catch (err) {
      console.error("Fetch Cart with Booking Error:", err);
    }
  }, []);

  // 3. createCart - Clean payload handling
  const createCart = async (cart) => {
    try {
      // Logic check: ensure numbers are numbers before sending to Oracle
      const payload = {
        ...cart,
        RENTAL_FEE: Number(cart.RENTAL_FEE),
        BOOKING_ID: cart.BOOKING_ID === "" ? null : Number(cart.BOOKING_ID)
      };
      
      await API.post("/api/cart", payload);
      await fetchCartWithBookingList(); 
      return true;
    } catch (err) {
      alert("Add Failed: " + (err.response?.data?.error || err.message));
      return false;
    }
  };

  // 4. updateCart - Clean payload handling
  const updateCart = async (cart) => {
    try {
      const payload = {
        ...cart,
        RENTAL_FEE: Number(cart.RENTAL_FEE),
        BOOKING_ID: (cart.BOOKING_ID === "" || cart.BOOKING_ID === null) ? null : Number(cart.BOOKING_ID)
      };

      await API.put(`/api/cart/${cart.CART_ID}`, payload);
      await fetchCartWithBookingList(); // Refresh to reflect edits
      return true;
    } catch (err) {
      alert("Update Failed: " + (err.response?.data?.error || err.message));
      return false;
    }
  };

  // 5. deleteCart - UI Sync
  const deleteCart = async (id) => {
    try {
      await API.delete(`/api/cart/${id}`);
      // Optimistic update: remove from local state immediately
      setCartWithBookingList(prev => prev.filter(c => c.CART_ID !== id));
      return true;
    } catch (err) {
      alert("Delete Failed: " + (err.response?.data?.error || "Constraint violation"));
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartList, 
      cartWithBookingList, 
      fetchCartList, 
      fetchCartWithBookingList, 
      createCart, 
      updateCart, 
      deleteCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);