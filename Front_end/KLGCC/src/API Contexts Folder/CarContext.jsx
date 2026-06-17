import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";
import { useAuth } from "./AuthContext.jsx";

const CarContext = createContext();

export const CarProvider = ({ children }) => {
  const [carList, setCarList] = useState([]);
  const { user } = useAuth();

  const fetchCarList = async () => {
    if (!user) return;
    try {
      const res = await API.get("/api/car/carList?limit=100");
      setCarList(res.data.cars || []);
    } catch (err) {
      console.error("Failed to load car list:", err);
    }
  };

  const createCar = async (car) => {
    try {
      await API.post("/api/car/addCar", car);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const updateCar = async (car) => {
    try {
      await API.put(`/api/car/${car.CARID}/carUpdate`, car);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteCar = async (id) => {
    try {
      await API.delete(`/api/car/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <CarContext.Provider value={{ carList, fetchCarList, createCar, updateCar, deleteCar }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => useContext(CarContext);