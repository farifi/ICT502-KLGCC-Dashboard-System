import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import EditTeeTimeForm from "../Components/Form/EditTeeTimeForm.jsx";
import AddTeeTimeForm from "../Components/Form/AddTeeTimeForm.jsx";
import { useTeeTime } from "../API Contexts Folder/TeeTimeContext.jsx";
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

// ---------------- Tee Time Management Page ----------------
const TeeTime = () => {
  // --- State Management ---
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTeeTime, setSelectedTeeTime] = useState(null);

  // --- Context Hooks ---
  const { 
    teeTimeList, 
    courseList, 
    totalPages, // Assuming totalPages is handled by your context
    fetchTeeTimeList, 
    fetchCourseList, 
    updateTeeTime, 
    deleteTeeTime, 
    createTeeTime 
  } = useTeeTime();

  // --- Side Effects ---
  useEffect(() => {
    // If your backend supports pagination, pass currentPage
    fetchTeeTimeList(currentPage);
    fetchCourseList();
  }, [currentPage, fetchTeeTimeList, fetchCourseList]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleRefresh = () => {
    fetchTeeTimeList(currentPage);
  };

  const handleEdit = (teeTime) => {
    setSelectedTeeTime(teeTime);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tee time?")) {
      const success = await deleteTeeTime(id);
      if (success) handleRefresh();
    }
  };

  const teeTimeColumns = [
    { header: "ID", key: "TEE_TIME_ID" },
    { header: "Course Name", key: "COURSE_NAME" },
    { header: "Start Time", key: "START_TIME_DISPLAY" }, 
    { header: "End Time", key: "END_TIME_DISPLAY" },
    { header: "Slots", key: "AVAILABLE_SLOTS" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button className="delete" onClick={() => handleDelete(row.TEE_TIME_ID)}>🗑</button>
        </div>
      )
    }
  ];

  return (
    <div className="default-page">
      <div className="default">
        <div className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={closeSidebar}></div>
        <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar closeSidebar={closeSidebar} />
        </div>

        <div className="default-main">
          <Header toggleSidebar={toggleSidebar} />
          <div className="table-header">
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>+ Add Tee Time</button>
          </div>
          <div className="default-content">
            <h2>Tee Time Management</h2>
            <Table columns={teeTimeColumns} data={teeTimeList} />
            
            {/* Standardized Pagination Controls */}
            <div className="pagination-container">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages || 1} 
                onPageChange={setCurrentPage} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} title="Edit Tee Time" onClose={() => setIsEditOpen(false)}>
        <EditTeeTimeForm
          teeTime={selectedTeeTime}
          courseList={courseList}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (formData) => {
            const payload = { ...formData, TEE_TIME_ID: selectedTeeTime.TEE_TIME_ID };
            const success = await updateTeeTime(payload);
            if (success) {
              setIsEditOpen(false);
              handleRefresh();
            }
          }}
        />
      </Modal>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} title="Add New Tee Time" onClose={() => setIsAddOpen(false)}>
        <AddTeeTimeForm
          courseList={courseList}
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (newData) => {
            const success = await createTeeTime(newData);
            if (success) {
              setIsAddOpen(false);
              handleRefresh();
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default TeeTime;