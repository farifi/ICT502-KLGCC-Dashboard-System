import { createContext, useContext, useState } from "react";
import API from "../Api.jsx";

const StaffContext = createContext();

export const StaffProvider = ({ children }) => {
    const [staffList, setStaffList]         = useState([]);
    const [driverList, setDriverList]       = useState([]);
    const [nonDriverList, setNonDriverList] = useState([]);

    const fetchStaffList = async () => {
        try {
            const res = await API.get("/api/staff/staffList");
            setStaffList(res.data.staffs || []);
        } catch (err) {
            alert(err.response?.data?.message || "Couldn't retrieve staff list");
        }
    };

    // ✅ New: staff who are also drivers
    const fetchDriverList = async () => {
        try {
            const res = await API.get("/api/staff/driverList");
            setDriverList(res.data.staffs || []);
        } catch (err) {
            alert(err.response?.data?.message || "Couldn't retrieve driver list");
        }
    };

    // ✅ New: staff who are NOT drivers
    const fetchNonDriverList = async () => {
        try {
            const res = await API.get("/api/staff/nonDriverList");
            setNonDriverList(res.data.staffs || []);
        } catch (err) {
            alert(err.response?.data?.message || "Couldn't retrieve non-driver staff list");
        }
    };

    const createStaff = async (staff) => {
        try {
            const res = await API.post("/api/staff/createStaff", staff);
            // Refresh all three lists so UI stays in sync
            await fetchStaffList();
            await fetchDriverList();
            await fetchNonDriverList();
        } catch (err) {
            alert("Failed to create staff");
        }
    };

    const deleteStaff = async (staffId) => {
        try {
            await API.delete(`/api/staff/${staffId}`);
            setStaffList(prev    => prev.filter(s    => s.STAFFID !== staffId));
            setDriverList(prev   => prev.filter(s    => s.STAFFID !== staffId));
            setNonDriverList(prev=> prev.filter(s    => s.STAFFID !== staffId));
        } catch (err) {
            alert("Failed to delete staff");
        }
    };

    const updateStaff = async (staff) => {
        try {
            await API.put(`/api/staff/${staff.STAFFID}`, staff);
            // Re-fetch all lists since a driver field change can shift someone between lists
            await fetchStaffList();
            await fetchDriverList();
            await fetchNonDriverList();
        } catch (err) {
            alert("Failed to update staff");
        }
    };

    return (
        <StaffContext.Provider value={{
            staffList,
            driverList,
            nonDriverList,
            fetchStaffList,
            fetchDriverList,
            fetchNonDriverList,
            deleteStaff,
            updateStaff,
            createStaff
        }}>
            {children}
        </StaffContext.Provider>
    );
};

export const useStaff = () => useContext(StaffContext);