import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";
import { useAuth } from "./AuthContext";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [customerList, setCustomerList] = useState([]);
  const [teeTimeList, setTeeTimeList] = useState([]);
  const [bookingList, setBookingList] = useState([]); // Added for Equipment dropdown
  const { user } = useAuth();

  const fetchCustomerList = async () => {
    if (!user) return;
    try {
      const res = await API.get("/api/customer/list");
      setCustomerList(res.data.customers || []);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't fetch customer list");
    }
  };

  const fetchTeeTimeList = async () => {
    if (!user) return;
    try {
      const res = await API.get("/api/teetime/list");
      setTeeTimeList(res.data.teeTimes || []);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't fetch tee times");
    }
  };

  // ✅ NEW: Fetch bookings for Equipment without breaking anything
  const fetchBookingListForEquipment = async () => {
    if (!user) return;
    try {
      // Hits router.get("/bookingList") from your bookingRoutes.js
      const res = await API.get("/api/booking/bookingList?limit=100");
      setBookingList(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to load bookings for dropdown:", err);
    }
  };

  const createBooking = async (booking) => {
    try {
      await API.post("/api/booking/addBooking", booking);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const updateBooking = async (booking) => {
    try {
      await API.put(`/api/booking/${booking.BOOKING_ID}/bookingUpdate`, booking);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteBooking = async (id) => {
    try {
      await API.delete(`/api/booking/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const confirmBooking = async (id) => {
    try {
      await API.put(`/api/booking/${id}/confirmBooking`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const cancelBooking = async (id) => {
    try {
      await API.put(`/api/booking/${id}/cancelBooking`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <BookingContext.Provider
      value={{
        customerList,
        teeTimeList,
        bookingList, // Shared
        fetchCustomerList,
        fetchTeeTimeList,
        fetchBookingListForEquipment, // Shared
        createBooking,
        updateBooking,
        deleteBooking,
        confirmBooking,
        cancelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);