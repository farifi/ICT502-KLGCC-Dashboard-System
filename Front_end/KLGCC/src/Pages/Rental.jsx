import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import EditRentalForm from "../Components/Form/EditRentalForm.jsx";
import AddRentalForm from "../Components/Form/AddRentalForm.jsx";
import { useRental } from "../API Contexts Folder/RentalContext.jsx";
import "./Pages CSS files/DefaultTheme.css";

// ---------------- Pagination Component ----------------
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];

  if (currentPage > 3) {
    pages.push(1);
    if (currentPage > 4) pages.push("...");
  }

  for (let p = currentPage - 2; p <= currentPage + 2; p++) {
    if (p > 0 && p <= totalPages) pages.push(p);
  }

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

// ---------------- Rental Management Page ----------------
const Rental = () => {
  const [isSidebarOpen, setIsSidebarOpen]   = useState(false);
  const [isEditOpen, setIsEditOpen]         = useState(false);
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  const [currentPage, setCurrentPage]       = useState(1);
  const itemsPerPage = 5;

  const {
    rentalWithDetailsList,
    fetchRentalList,
    fetchRentalWithDetailsList,
    createRental,
    updateRental,
    deleteRental
  } = useRental();

  useEffect(() => {
    fetchRentalList();
    fetchRentalWithDetailsList();
  }, [fetchRentalList, fetchRentalWithDetailsList]);

  const totalPages  = Math.ceil(rentalWithDetailsList.length / itemsPerPage);
  const currentData = rentalWithDetailsList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = [
    { header: "ID",          key: "RENTALID" },
    { header: "Customer",    key: "CUSTOMER_NAME" },
    { header: "Car Plate No",      key: "CAR_PLATENO" },
    { header: "Pickup Date", key: "RENTALPICKUPDATE" },
    { header: "Return Date", key: "RENTALRETURNDATE" },
    { header: "Total (RM)",  key: "RENTALTOTALCOST", render: (r) => r.RENTALTOTALCOST ? `RM ${Number(r.RENTALTOTALCOST).toFixed(2)}` : "-" },
    { header: "Status",      key: "RENTALSTATUS" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => { setSelectedRental(row); setIsEditOpen(true); }}>✏️</button>
          <button
            className="delete"
            onClick={() => confirm("Delete this rental?") && deleteRental(row.RENTALID)}
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
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>+ Add Rental</button>
          </div>
          <div className="default-content">
            <h2>Rental Management</h2>
            <Table
              title="Rental Management"
              columns={columns}
              data={currentData.map(item => ({ ...item, id: item.RENTALID }))}
            />
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

      <Modal isOpen={isEditOpen} title="Edit Rental" onClose={() => setIsEditOpen(false)}>
        <EditRentalForm
          rental={selectedRental}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (d) => {
            const success = await updateRental(d);
            if (success) setIsEditOpen(false);
          }}
        />
      </Modal>

      <Modal isOpen={isAddOpen} title="Add Rental" onClose={() => setIsAddOpen(false)}>
        <AddRentalForm
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (d) => {
            const success = await createRental(d);
            if (success) setIsAddOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default Rental;