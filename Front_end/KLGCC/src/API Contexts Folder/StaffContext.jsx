import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";

const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
    const [staffList, setStaffList] = useState([]);
    const [driverList, setDriverList] = useState([]);

    // ================= STAFF =================
    const fetchStaffList = async () => {
        try {
            const res = await API.get("/api/staff/staffList");
            setStaffList(res.data.staffs);
        } catch (err) {
            alert(err.response?.data?.message || "Couldn't retrieve staff");
        }
    };

    // ================= DRIVER =================
    const fetchDriverList = async () => {
        try {
            const res = await API.get("/api/staff/driverList");
            setDriverList(res.data.drivers);
        } catch (err) {
            alert(err.response?.data?.message || "Couldn't retrieve drivers");
        }
    };

    // ================= CREATE STAFF =================
    const createStaff = async (staff) => {
        try {
            const res = await API.post("/api/staff/createStaff", staff);
            setStaffList(prev => [...prev, res.data.staff]);
        } catch (err) {
            alert("Failed to create staff");
        }
    };

    // ================= DELETE STAFF =================
    const deleteStaff = async (staffId) => {
        try {
            await API.delete(`/api/staff/${staffId}`);

            setStaffList(prev => prev.filter(s => s.STAFFID !== staffId));
            setDriverList(prev => prev.filter(d => d.STAFFID !== staffId));

        } catch (err) {
            alert("Failed to delete staff");
        }
    };

    // ================= UPDATE STAFF =================
    const updateStaff = async (staff) => {
        try {
            await API.put(`/api/staff/${staff.STAFFID}`, staff);

            setStaffList(prev =>
                prev.map(s => s.STAFFID === staff.STAFFID ? staff : s)
            );

            setDriverList(prev =>
                prev.map(d => d.STAFFID === staff.STAFFID ? { ...d, ...staff } : d)
            );

        } catch (err) {
            alert("Failed to update staff");
        }
    };

    return (
        <StaffContext.Provider value={{
            staffList,
            driverList,
            fetchStaffList,
            fetchDriverList,
            deleteStaff,
            updateStaff,
            createStaff
        }}>
            {children}
        </StaffContext.Provider>
    );
};

export const useStaff = () => useContext(StaffContext);