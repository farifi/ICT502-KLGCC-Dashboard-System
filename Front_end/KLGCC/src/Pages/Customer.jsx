import { useState, useEffect } from "react";
import { useCustomer } from "../API Contexts Folder/CustomerContext";

import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Table from "../Components/Table";
import Modal from "../Components/Modal";
import AddCustomerForm from "../Components/Form/AddCustomerForm";
import EditCustomerForm from "../Components/Form/EditCustomerForm";

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
    if (p > 0 && p <= totalPages) {
      pages.push(p);
    }
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

// ---------------- Customer Page ----------------
const Customer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const {
    customers,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomer();

  const customerColumns = [
    {
      header: "ID",
      key: "CUSTID",
    },
    {
      header: "Name",
      key: "CUSTNAME",
    },
    {
      header: "Phone",
      key: "CUSTPHONENUM",
    },
    {
      header: "IC",
      key: "CUSTIC",
    },
    {
      header: "Email",
      key: "CUSTEMAIL",
    },
    {
      header: "License No",
      key: "CUSTLICENSENO",
    },
    {
      header: "Address",
      key: "CUSTADDRESS",
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>
            ✏️
          </button>

          <button
            className="delete"
            onClick={() => handleDelete(row.CUSTID)}
          >
            🗑
          </button>
        </div>
      ),
    },
  ];

  const refreshCustomers = () => {
    fetchCustomers(page, setTotalPages);
  };

  useEffect(() => {
    fetchCustomers(page, setTotalPages);
  }, [page]);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this customer?"
    );

    if (!confirmed) return;

    await deleteCustomer(id);
    refreshCustomers();
  };

  return (
    <div className="default-page">
      <div className="default">
        <div
          className={`sidebar-overlay ${
            isSidebarOpen ? "open" : ""
          }`}
          onClick={closeSidebar}
        />

        <div
          className={`sidebar-wrapper ${
            isSidebarOpen ? "open" : ""
          }`}
        >
          <Sidebar closeSidebar={closeSidebar} />
        </div>

        <div className="default-main">
          <Header toggleSidebar={toggleSidebar} />

          <div className="table-header">
            <button
              className="add-btn"
              onClick={() => setIsAddOpen(true)}
            >
              + Add Customer
            </button>
          </div>

          <div className="default-content">
            <h2>Customers</h2>

            <Table
              columns={customerColumns}
              data={customers}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Add Customer */}
      <Modal
        isOpen={isAddOpen}
        title="Add Customer"
        onClose={() => setIsAddOpen(false)}
      >
        <AddCustomerForm
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (data) => {
            await createCustomer(data);
            setIsAddOpen(false);
            refreshCustomers();
          }}
        />
      </Modal>

      {/* Edit Customer */}
      <Modal
        isOpen={isEditOpen}
        title="Edit Customer"
        onClose={() => setIsEditOpen(false)}
      >
        <EditCustomerForm
          customer={selectedCustomer}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (data) => {
            await updateCustomer(data);
            setIsEditOpen(false);
            refreshCustomers();
          }}
        />
      </Modal>
    </div>
  );
};

export default Customer;