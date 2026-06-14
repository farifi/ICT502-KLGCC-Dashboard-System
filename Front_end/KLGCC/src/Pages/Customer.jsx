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

// ---------------- Customer Page ----------------
const Customer = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const {
    allCustomers,
    memberCustomers,
    walkinCustomers,
    fetchAllCustomers,
    fetchMemberCustomers,
    fetchWalkinCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  } = useCustomer();

  // Pagination states
  const [allPage, setAllPage] = useState(1);
  const [memberPage, setMemberPage] = useState(1);
  const [walkinPage, setWalkinPage] = useState(1);

  const [allTotalPages, setAllTotalPages] = useState(1);
  const [memberTotalPages, setMemberTotalPages] = useState(1);
  const [walkinTotalPages, setWalkinTotalPages] = useState(1);

  // Add / Edit Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customerColumns = [
    { header: "ID", key: "CUSTOMER_ID" },
    { header: "Full Name", key: "FULL_NAME" },
    { header: "Email", key: "EMAIL" },
    { header: "Phone", key: "PHONE_NUMBER" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button className="delete" onClick={() => handleDelete(row.CUSTOMER_ID)}>🗑</button>
        </div>
      ),
    },
  ];

  const refreshAll = () => {
    fetchAllCustomers(allPage, setAllTotalPages);
    fetchMemberCustomers(memberPage, setMemberTotalPages);
    fetchWalkinCustomers(walkinPage, setWalkinTotalPages);
  };

  useEffect(() => { refreshAll(); }, []);
  useEffect(() => { fetchAllCustomers(allPage, setAllTotalPages); }, [allPage]);
  useEffect(() => { fetchMemberCustomers(memberPage, setMemberTotalPages); }, [memberPage]);
  useEffect(() => { fetchWalkinCustomers(walkinPage, setWalkinTotalPages); }, [walkinPage]);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    await deleteCustomer(id);
    refreshAll();
  };

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
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>+ Add Customer</button>
          </div>

          <div className="default-content">
            <h2>All Customers</h2>
            <Table columns={customerColumns} data={allCustomers} />
            <Pagination currentPage={allPage} totalPages={allTotalPages} onPageChange={setAllPage} />

            <h2>Member Customers</h2>
            <Table columns={customerColumns} data={memberCustomers} />
            <Pagination currentPage={memberPage} totalPages={memberTotalPages} onPageChange={setMemberPage} />

            <h2>Walk-In Customers</h2>
            <Table columns={customerColumns} data={walkinCustomers} />
            <Pagination currentPage={walkinPage} totalPages={walkinTotalPages} onPageChange={setWalkinPage} />
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} title="Add Customer" onClose={() => setIsAddOpen(false)}>
        <AddCustomerForm
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (data) => {
            await createCustomer(data);
            setIsAddOpen(false);
            refreshAll();
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} title="Edit Customer" onClose={() => setIsEditOpen(false)}>
        <EditCustomerForm
          customer={selectedCustomer}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (data) => {
            await updateCustomer(data);
            setIsEditOpen(false);
            refreshAll();
          }}
        />
      </Modal>
    </div>
  );
};

export default Customer;
