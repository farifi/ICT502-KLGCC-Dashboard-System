import { createContext, useContext, useState, useCallback } from "react";
import API from "../Api.jsx";
import { useAuth } from "./AuthContext.jsx";

const CarContext = createContext();

export const CarProvider = ({ children }) => {
  const [carList, setCarList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // 1. GET - Fetch cars with pagination
  const fetchCarList = useCallback(async (page = 1, limit = 5) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/car/carList?page=${page}&limit=${limit}`);
      setCarList(res.data.cars || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load car list:", err);
      setCarList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. CREATE - Add a new car
  const createCar = async (car) => {
    try {
      await API.post("/api/car/addCar", car);
      await fetchCarList(1);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to create car";
      console.error("Add API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 3. UPDATE - Edit existing car
  const updateCar = async (car) => {
    try {
      const id = car.CARID;
      if (!id) throw new Error("Missing CARID");

      await API.put(`/api/car/${id}/carUpdate`, car);
      await fetchCarList(currentPage);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Update failed";
      console.error("Update API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 4. DELETE - Remove a car
  const deleteCar = async (id) => {
    try {
      await API.delete(`/api/car/${id}`);

      const nextPage =
        carList.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      await fetchCarList(nextPage);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Delete failed";
      console.error("Delete API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  return (
    <CarContext.Provider
      value={{
        carList,
        totalPages,
        currentPage,
        loading,
        fetchCarList,
        createCar,
        updateCar,
        deleteCar,
        setCurrentPage,
      }}
    >
      {children}
    </CarContext.Provider>
  );
};

export const useCar = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error("useCar must be used within a CarProvider");
  }
  return context;
};