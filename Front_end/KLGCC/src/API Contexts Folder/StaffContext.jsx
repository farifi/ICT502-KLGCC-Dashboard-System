import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";

const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
    const [staffList, setStaffList] = useState([]);

    const fetchStaffList = async () => {
        try {
            const res = await API.get("/api/staff/staffList");
            setStaffList(res.data.staffs);
        } catch (err) {
            alert(err.response?.data?.message || "Couldn't retrieve");
        }
    };

    const createStaff = async (staff) => {
        try {
          const res = await API.post("/api/staff/createStaff", staff);
          setStaffList(prev => [...prev, res.data.staff]);
        } catch (err) {
          alert("Failed to create staff");
        }
      };
      

    const deleteStaff = async (staff_id) => {
        try {
            const res = await API.delete(`/api/staff/${staff_id}`);
            setStaffList( prev => prev.filter(
                staff => staff.STAFF_ID !== staff_id 
            ));
            res.data.message;
        } catch (err) {
            alert("Failed to delete staff");
        }
    };

    const updateStaff = async (staff) => {
        try {
            await API.put(`/api/staff/${staff.STAFF_ID}`, staff);
            setStaffList(prev =>
                prev.map(s => s.STAFF_ID === staff.STAFF_ID ? staff : s)
            );
        } catch (err) {
            alert("Failed to update staff");
        }
    };


    return (
        <StaffContext.Provider value={{ staffList, fetchStaffList , deleteStaff, updateStaff, createStaff}}>
            {children}
        </StaffContext.Provider>
    );
};

export const useStaff = () => {
    return useContext(StaffContext);
};
