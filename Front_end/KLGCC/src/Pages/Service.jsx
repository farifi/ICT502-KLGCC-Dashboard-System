import { useState, useEffect } from "react";
import { useService } from "../API Contexts Folder/ServiceContext";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import EditServiceForm from "../Components/Form/EditServiceForm.jsx";
import AddServiceForm from "../Components/Form/AddServiceForm.jsx";

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
          <span key={idx} className="dots">
            ...
          </span>
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

// ---------------- Service Page ----------------
const Service = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const {
    serviceList,
    totalPages,
    fetchServiceList,
    updateService,
    deleteService,
    createService,
  } = useService();

  useEffect(() => {
    fetchServiceList(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchServiceList(currentPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service record?")) {
      await deleteService(id);
      handleRefresh();
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return isNaN(d) ? "-" : d.toLocaleDateString("en-MY");
  };

  const serviceColumns = [
    {
      header: "ID",
      key: "SERVICEID",
    },
    {
      header: "Car Model",
      key: "CARMODEL",
    },
    {
      header: "Staff Name",
      key: "STAFFNAME",
    },
    {
      header: "Date",
      key: "SERVICEDATE",
      render: (row) => formatDate(row.SERVICEDATE),
    },
    {
      header: "Description",
      key: "SERVICEDESCRIPTION",
    },
    {
      header: "Cost (RM)",
      key: "SERVICECOST",
      render: (row) => `RM ${Number(row.SERVICECOST).toFixed(2)}`,
    },
    {
      header: "Next Date",
      key: "SERVICENEXTDATE",
      render: (row) => formatDate(row.SERVICENEXTDATE),
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button
            onClick={() => {
              setSelectedService(row);
              setIsEditOpen(true);
            }}
          >
            ✏️
          </button>

          <button
            className="delete"
            onClick={() => handleDelete(row.SERVICEID)}
          >
            🗑
          </button>
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
          <Header
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div className="table-header">
            <button
              className="add-btn"
              onClick={() => setIsAddOpen(true)}
            >
              + Add Service
            </button>
          </div>

          <div className="default-content">
            <h2>Service Management</h2>

            <Table
              columns={serviceColumns}
              data={serviceList}
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

      {/* Add Service */}
      <Modal
        isOpen={isAddOpen}
        title="Add New Service"
        onClose={() => setIsAddOpen(false)}
      >
        <AddServiceForm
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (data) => {
            await createService(data);
            setIsAddOpen(false);
            handleRefresh();
          }}
        />
      </Modal>

      {/* Edit Service */}
      <Modal
        isOpen={isEditOpen}
        title="Edit Service"
        onClose={() => setIsEditOpen(false)}
      >
        <EditServiceForm
          service={selectedService}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (data) => {
            await updateService(data);
            setIsEditOpen(false);
            handleRefresh();
          }}
        />
      </Modal>
    </div>
  );
};

export default Service;