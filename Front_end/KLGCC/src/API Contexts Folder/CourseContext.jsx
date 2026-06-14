import { createContext, useContext, useState, useCallback } from "react";
import API from "../Api.jsx";

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courseList, setCourseList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 1. GET - Fetch courses with pagination
  const fetchCourseList = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/api/course/list?page=${page}&limit=5`);
      setCourseList(res.data.courses || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. CREATE - Add a new course
  const createCourse = async (courseData) => {
    try {
      await API.post("/api/course", courseData);
      // Refresh to the first page to see the newest entry
      await fetchCourseList(1);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create course";
      console.error("Add API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 3. UPDATE - Edit existing course
  const updateCourse = async (courseData) => {
    try {
      const id = courseData.COURSE_ID;
      if (!id) throw new Error("Missing COURSE_ID");

      await API.put(`/api/course/${id}`, courseData);
      // Refresh the current page to show updated data
      await fetchCourseList(currentPage);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Update failed";
      console.error("Update API error:", err.response?.data);
      alert(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  // 4. DELETE - Remove a course
  const deleteCourse = async (id) => {
    try {
      await API.delete(`/api/course/${id}`);
      
      // If the last item on the page is deleted, jump back one page
      const nextPage = courseList.length === 1 && currentPage > 1 
        ? currentPage - 1 
        : currentPage;
        
      await fetchCourseList(nextPage);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete course. It might be linked to existing Tee Times.");
    }
  };

  return (
    <CourseContext.Provider
      value={{
        courseList,
        totalPages,
        currentPage,
        loading,
        fetchCourseList,
        createCourse,
        updateCourse,
        deleteCourse,
        setCurrentPage
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};