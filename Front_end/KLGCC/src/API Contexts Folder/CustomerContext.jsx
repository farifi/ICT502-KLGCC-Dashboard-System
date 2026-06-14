import { createContext, useContext, useState } from "react";
import API from "../Api";
import { useAuth } from "./AuthContext";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { user } = useAuth();

  const [allCustomers, setAllCustomers] = useState([]);
  const [memberCustomers, setMemberCustomers] = useState([]);
  const [walkinCustomers, setWalkinCustomers] = useState([]);

  // -------- All Customers (Paginated)
  const fetchAllCustomers = async (page = 1, setTotalPages = () => {}) => {
    if (!user) return;
    try {
      const res = await API.get("/api/customer/customerList", {
        params: { page, limit: 5 }
      });
      setAllCustomers(res.data.customers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      alert(err.response?.data?.message || "Cannot fetch all customers");
    }
  };

  // -------- Member Customers
  const fetchMemberCustomers = async (page = 1, setTotalPages = () => {}) => {
    if (!user) return;
    try {
      const res = await API.get("/api/customer/memberList", {
        params: { page, limit: 5 }
      });
      setMemberCustomers(res.data.customers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      alert(err.response?.data?.message || "Cannot fetch member customers");
    }
  };

  // -------- Walk-in Customers
  const fetchWalkinCustomers = async (page = 1, setTotalPages = () => {}) => {
    if (!user) return;
    try {
      const res = await API.get("/api/customer/walkinList", {
        params: { page, limit: 5 }
      });
      setWalkinCustomers(res.data.customers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      alert(err.response?.data?.message || "Cannot fetch walk-in customers");
    }
  };

  // -------- Create Customer
  const createCustomer = async (data) => {
    try {
      await API.post("/api/customer/add", data);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't create customer");
    }
  };

  // -------- Update Customer
  const updateCustomer = async (data) => {
    try {
      await API.put(`/api/customer/${data.CUSTOMER_ID}`, data);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update customer");
    }
  };

  // -------- Delete Customer
  const deleteCustomer = async (id) => {
    try {
      await API.delete(`/api/customer/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't delete customer");
    }
  };

  return (
    <CustomerContext.Provider value={{
      allCustomers,
      memberCustomers,
      walkinCustomers,
      fetchAllCustomers,
      fetchMemberCustomers,
      fetchWalkinCustomers,
      createCustomer,
      updateCustomer,
      deleteCustomer,
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
