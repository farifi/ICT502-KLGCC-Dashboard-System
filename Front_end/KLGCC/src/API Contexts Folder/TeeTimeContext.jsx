import { createContext, useContext, useState, useCallback } from "react";
import API from "../Api.jsx";

const TeeTimeContext = createContext();

export const TeeTimeProvider = ({ children }) => {
  const [teeTimeList, setTeeTimeList] = useState([]);
  const [courseList, setCourseList] = useState([]);

  const fetchTeeTimeList = useCallback(async () => {
    try {
      const res = await API.get("/api/teetime/listWithCourse");
      setTeeTimeList(res.data.teeTimes || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchCourseList = useCallback(async () => {
    try {
      const res = await API.get("/api/course/list?page=1&limit=100");
      setCourseList(res.data.courses || []);
    } catch (err) { console.error(err); }
  }, []);

  const createTeeTime = async (teeTimeData) => {
    try {
      await API.post("/api/teetime", teeTimeData);
      await fetchTeeTimeList();
      return true; 
    } catch (err) {
      alert(err.response?.data?.message || "Add Failed");
      return false;
    }
  };

  const updateTeeTime = async (updatedData) => {
    try {
      // In TeeTime.jsx, we pass the merged object containing TEE_TIME_ID
      await API.put(`/api/teetime/${updatedData.TEE_TIME_ID}`, updatedData);
      await fetchTeeTimeList();
      return true;
    } catch (err) {
      alert(err.response?.data?.message || "Update Failed");
      return false;
    }
  };

  const deleteTeeTime = async (id) => {
    try {
      await API.delete(`/api/teetime/${id}`);
      await fetchTeeTimeList();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    <TeeTimeContext.Provider value={{ 
      teeTimeList, courseList, fetchTeeTimeList, 
      fetchCourseList, createTeeTime, updateTeeTime, deleteTeeTime 
    }}>
      {children}
    </TeeTimeContext.Provider>
  );
};

export const useTeeTime = () => useContext(TeeTimeContext);