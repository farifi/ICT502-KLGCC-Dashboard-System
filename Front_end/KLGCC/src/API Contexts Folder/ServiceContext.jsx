import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
  const [serviceList, setServiceList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServiceList = async (page = 1) => {
    try {
      const res = await API.get(`/api/service?page=${page}&limit=5`);
      setServiceList(res.data.services || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const createService = async (service) => {
    try {
      await API.post("/api/service", service);
      await fetchServiceList(1);
    } catch (err) {
      console.error("Create service error:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to create service");
    }
  };

  const updateService = async (service) => {
    try {
      await API.put(`/api/service/${service.SERVICEID}`, service);
      await fetchServiceList();
    } catch (err) {
      console.error("Update service error:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to update service");
    }
  };

  const deleteService = async (id) => {
    try {
      await API.delete(`/api/service/${id}`);
      await fetchServiceList();
    } catch (err) {
      console.error("Delete service error:", err.response?.data);
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to delete service");
    }
  };

  return (
    <ServiceContext.Provider
      value={{ serviceList, totalPages, fetchServiceList, createService, updateService, deleteService }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => useContext(ServiceContext);