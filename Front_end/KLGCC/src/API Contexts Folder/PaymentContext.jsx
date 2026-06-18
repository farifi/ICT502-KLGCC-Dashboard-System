import { createContext, useContext, useState, useCallback } from "react";
import API from "../Api.jsx";

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentList, setPaymentList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 1. GET - Fetch payments with pagination
  const fetchPaymentList = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/payment/list?page=${page}&limit=5`);
      setPaymentList(res.data.payments || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch failed:", err);
      setPaymentList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CREATE - Add a new payment
  const createPayment = async (paymentData) => {
    try {
      await API.post("/api/payment", paymentData);
      await fetchPaymentList(1);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create payment";
      console.error("Add API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 3. UPDATE - Edit existing payment
  const updatePayment = async (paymentData) => {
    try {
      const id = paymentData.PAYMENTID;
      if (!id) throw new Error("Missing PAYMENTID");

      await API.put(`/api/payment/${id}`, paymentData);
      await fetchPaymentList(currentPage);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Update failed";
      console.error("Update API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 4. DELETE - Remove a payment
  const deletePayment = async (id) => {
    try {
      await API.delete(`/api/payment/${id}`);

      const nextPage =
        paymentList.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      await fetchPaymentList(nextPage);
      return { success: true };
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete payment. It might be linked to existing records.");
      return { success: false };
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        paymentList,
        totalPages,
        currentPage,
        loading,
        fetchPaymentList,
        createPayment,
        updatePayment,
        deletePayment,
        setCurrentPage,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
};