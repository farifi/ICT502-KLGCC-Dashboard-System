import { useState, useEffect } from "react";
import { useEquipment } from "../API Contexts Folder/EquipmentContext";
import { useBooking } from "../API Contexts Folder/BookingContext";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import EditEquipmentForm from "../Components/Form/EditEquipmentForm.jsx";
import AddEquipmentForm from "../Components/Form/AddEquipmentForm.jsx";

// ---------------- Pagination Component (Same as Customer) ----------------
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

// ---------------- Equipment Page ----------------
const Equipment = () => {
  // --- State Management ---
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // --- Context Hooks ---
  const { 
    equipmentList, 
    totalPages, 
    fetchEquipmentList, 
    updateEquipment, 
    deleteEquipment, 
    createEquipment 
  } = useEquipment();

  const { 
    bookingList, 
    fetchBookingListForEquipment 
  } = useBooking();

  // --- Side Effects ---
  useEffect(() => {
    fetchEquipmentList(currentPage);
    
    if (fetchBookingListForEquipment) {
      fetchBookingListForEquipment();
    }
  }, [currentPage]);

  // --- Actions ---
  const handleRefresh = () => {
    fetchEquipmentList(currentPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      await deleteEquipment(id);
      handleRefresh();
    }
  };

  // --- Table Column Definitions ---
  const equipmentColumns = [
    { header: "ID", key: "EQUIPMENT_ID" },
    { header: "Type", key: "EQUIPMENT_TYPE" },
    { header: "Fee (RM)", key: "FEE", render: (row) => `RM ${Number(row.FEE).toFixed(2)}` },
    { header: "Booking ID", key: "BOOKING_ID" },
    { header: "Customer", key: "CUSTOMER_NAME" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button 
            onClick={() => { 
              setSelectedEquipment(row); 
              setIsEditOpen(true); 
            }}
          >
            ✏️
          </button>
          <button 
            className="delete" 
            onClick={() => handleDelete(row.EQUIPMENT_ID)}
          >
            🗑
          </button>
        </div>
      )
    }
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
              + Add Equipment
            </button>
          </div>

          <div className="default-content">
            <h2>Equipment Management</h2>
            <Table 
              columns={equipmentColumns} 
              data={equipmentList} 
            />
            
            {/* Standardized Pagination Component */}
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

      {/* Modal for Adding Equipment */}
      <Modal 
        isOpen={isAddOpen} 
        title="Add New Equipment" 
        onClose={() => setIsAddOpen(false)}
      >
        <AddEquipmentForm 
          bookingList={bookingList} 
          onCancel={() => setIsAddOpen(false)} 
          onCreate={async (data) => { 
            await createEquipment(data); 
            setIsAddOpen(false); 
            handleRefresh();
          }} 
        />
      </Modal>

      {/* Modal for Editing Equipment */}
      <Modal 
        isOpen={isEditOpen} 
        title="Edit Equipment" 
        onClose={() => setIsEditOpen(false)}
      >
        <EditEquipmentForm 
          equipment={selectedEquipment} 
          bookingList={bookingList}
          onCancel={() => setIsEditOpen(false)} 
          onSave={async (data) => { 
            await updateEquipment(data); 
            setIsEditOpen(false); 
            handleRefresh();
          }} 
        />
      </Modal>
    </div>
  );
};

export default Equipment;