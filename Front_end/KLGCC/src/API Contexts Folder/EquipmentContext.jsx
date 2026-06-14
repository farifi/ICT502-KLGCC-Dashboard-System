import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";

const EquipmentContext = createContext();

export const EquipmentProvider = ({ children }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEquipmentList = async (page = 1) => {
    try {
      const res = await API.get(`/api/equipment?page=${page}&limit=5`);
      setEquipmentList(res.data.equipment || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const createEquipment = async (equipment) => {
    try {
      // Hits router.post("/") in equipmentRoutes.js
      await API.post("/api/equipment", equipment);
      await fetchEquipmentList(1);
    } catch (err) {
      alert("Error: Check if the Booking ID exists.");
    }
  };

  const updateEquipment = async (equipment) => {
    try {
      await API.put(`/api/equipment/${equipment.EQUIPMENT_ID}`, equipment);
      await fetchEquipmentList();
    } catch (err) {
      alert("Failed to update equipment");
    }
  };

  const deleteEquipment = async (id) => {
    try {
      await API.delete(`/api/equipment/${id}`);
      await fetchEquipmentList();
    } catch (err) {
      alert("Failed to delete equipment");
    }
  };

  return (
    <EquipmentContext.Provider value={{ equipmentList, totalPages, fetchEquipmentList, createEquipment, updateEquipment, deleteEquipment }}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipment = () => useContext(EquipmentContext);