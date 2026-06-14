import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import { useCourse } from "../API Contexts Folder/CourseContext";
import AddCourseForm from "../Components/Form/AddCourseForm.jsx";
import EditCourseForm from "../Components/Form/EditCourseForm.jsx";
import "./Pages CSS files/DefaultTheme.css";

// ---------------- Standardized Pagination Component ----------------
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];

  // Always show first page
  if (currentPage > 3) {
    pages.push(1);
    if (currentPage > 4) pages.push("...");
  }

  // Middle sliding window
  for (let p = currentPage - 2; p <= currentPage + 2; p++) {
    if (p > 0 && p <= totalPages) pages.push(p);
  }

  // Always show last page
  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="pagination">
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={idx} className="dots">...</span>
        ) : (
          <button
            key={p}
            className={p === currentPage ? "active" : ""}
            disabled={p === currentPage}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
    </div>
  );
};

// ---------------- Course Management Page ----------------
const Course = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { 
    courseList, 
    totalPages, 
    fetchCourseList, 
    createCourse, 
    updateCourse, 
    deleteCourse 
  } = useCourse();

  // Fetch data whenever page changes
  useEffect(() => {
    fetchCourseList(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchCourseList(currentPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(id);
      handleRefresh();
    }
  };

  const courseColumns = [
    { header: "ID", key: "COURSE_ID" },
    { header: "Name", key: "COURSE_NAME" },
    { header: "Description", key: "DESCRIPTION" },
    { header: "Holes", key: "HOLES" },
    { header: "Difficulty", key: "DIFFICULTY_LEVEL" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => { setSelectedCourse(row); setIsEditOpen(true); }}>✏️</button>
          <button className="delete" onClick={() => handleDelete(row.COURSE_ID)}>🗑</button>
        </div>
      ),
    },
  ];

  return (
    <div className="default-page">
      <div className="default">
        <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar />
        </div>
        
        <div className="default-main">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="table-header">
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>
              + Add Course
            </button>
          </div>
          
          <div className="default-content">
            <h2>Course Management</h2>
            <Table columns={courseColumns} data={courseList} />
            
            <div className="pagination-container">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} title="Add New Course" onClose={() => setIsAddOpen(false)}>
        <AddCourseForm 
          onCancel={() => setIsAddOpen(false)} 
          onCreate={async (data) => { 
            await createCourse(data); 
            setIsAddOpen(false); 
            handleRefresh(); 
          }} 
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} title="Edit Course" onClose={() => setIsEditOpen(false)}>
        <EditCourseForm 
          course={selectedCourse} 
          onCancel={() => setIsEditOpen(false)} 
          onSave={async (data) => { 
            await updateCourse(data); 
            setIsEditOpen(false); 
            handleRefresh(); 
          }} 
        />
      </Modal>
    </div>
  );
};

export default Course;