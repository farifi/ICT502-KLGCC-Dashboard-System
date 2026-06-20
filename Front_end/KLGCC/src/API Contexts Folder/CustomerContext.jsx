import { createContext, useContext, useState } from "react";
import API from "../Api";
import { useAuth } from "./AuthContext";

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);

  // NOTE: added an optional `limit` param (defaults to 5, same as before).
  // Existing calls like fetchCustomers(page, setTotalPages) still work
  // unchanged. Pass a larger limit (e.g. fetchCustomers(1, () => {}, 1000))
  // when you need "all customers" for a dropdown instead of a paginated page.
  const fetchCustomers = async (page = 1, setTotalPages = () => {}, limit = 5) => {
    if (!user) return;
    try {
      const res = await API.get("/api/customer/customerList", {
        params: { page, limit },
      });
      setCustomers(res.data.customers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch customers");
    }
  };

  const createCustomer = async (data) => {
    try {
      await API.post("/api/customer/add", data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create customer");
    }
  };

  const updateCustomer = async (data) => {
    try {
      // data.CUSTID comes from the selected row (raw Oracle column key)
      await API.put(`/api/customer/${data.CUSTID}`, data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update customer");
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await API.delete(`/api/customer/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete customer");
    }
  };

  return (
    <CustomerContext.Provider
      value={{ customers, fetchCustomers, createCustomer, updateCustomer, deleteCustomer }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);