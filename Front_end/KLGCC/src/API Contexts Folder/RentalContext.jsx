import { createContext, useContext, useState, useCallback } from "react";
import API from "../Api.jsx";

const RentalContext = createContext();

export const RentalProvider = ({ children }) => {
  const [rentalList, setRentalList]                   = useState([]);
  const [rentalWithDetailsList, setRentalWithDetailsList] = useState([]);

  const fetchRentalList = useCallback(async () => {
    try {
      const res = await API.get("/api/rental/list");
      setRentalList(res.data.rentals || []);
    } catch (err) {
      console.error("Fetch Rental List Error:", err);
    }
  }, []);

  const fetchRentalWithDetailsList = useCallback(async () => {
    try {
      const res = await API.get("/api/rental/listWithDetails");
      setRentalWithDetailsList([...(res.data.rentals || [])]);
    } catch (err) {
      console.error("Fetch Rental With Details Error:", err);
    }
  }, []);

  const createRental = async (rental) => {
    try {
      const payload = {
        ...rental,
        CUSTID:          Number(rental.CUSTID),
        CARID:           Number(rental.CARID),
        PAYMENTID:       rental.PAYMENTID       ? Number(rental.PAYMENTID)       : null,
        STAFFID:         rental.STAFFID         ? Number(rental.STAFFID)         : null,
        RENTALTOTALCOST: rental.RENTALTOTALCOST ? Number(rental.RENTALTOTALCOST) : null,
      };
      await API.post("/api/rental", payload);
      await fetchRentalWithDetailsList();
      return true;
    } catch (err) {
      alert("Add Failed: " + (err.response?.data?.error || err.message));
      return false;
    }
  };

  const updateRental = async (rental) => {
    try {
      const payload = {
        ...rental,
        CUSTID:          Number(rental.CUSTID),
        CARID:           Number(rental.CARID),
        PAYMENTID:       rental.PAYMENTID       ? Number(rental.PAYMENTID)       : null,
        STAFFID:         rental.STAFFID         ? Number(rental.STAFFID)         : null,
        RENTALTOTALCOST: rental.RENTALTOTALCOST ? Number(rental.RENTALTOTALCOST) : null,
      };
      await API.put(`/api/rental/${rental.RENTALID}`, payload);
      await fetchRentalWithDetailsList();
      return true;
    } catch (err) {
      alert("Update Failed: " + (err.response?.data?.error || err.message));
      return false;
    }
  };

  const deleteRental = async (id) => {
    try {
      await API.delete(`/api/rental/${id}`);
      setRentalWithDetailsList(prev => prev.filter(r => r.RENTALID !== id));
      return true;
    } catch (err) {
      alert("Delete Failed: " + (err.response?.data?.error || "Constraint violation"));
      return false;
    }
  };

  return (
    <RentalContext.Provider value={{
      rentalList,
      rentalWithDetailsList,
      fetchRentalList,
      fetchRentalWithDetailsList,
      createRental,
      updateRental,
      deleteRental
    }}>
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = () => useContext(RentalContext);