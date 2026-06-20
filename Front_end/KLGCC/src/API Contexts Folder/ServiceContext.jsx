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
      alert("Error: Check if the Car ID or Staff ID exists.");
    }
  };

  const updateService = async (service) => {
    try {
      await API.put(`/api/service/${service.SERVICEID}`, service);
      await fetchServiceList();
    } catch (err) {
      alert("Failed to update service");
    }
  };

  const deleteService = async (id) => {
    try {
      await API.delete(`/api/service/${id}`);
      await fetchServiceList();
    } catch (err) {
      alert("Failed to delete service");
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