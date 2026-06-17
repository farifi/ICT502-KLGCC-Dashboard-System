import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import { usePayment } from "../API Contexts Folder/PaymentContext.jsx";
import AddPaymentForm from "../Components/Form/AddPaymentForm.jsx";
import EditPaymentForm from "../Components/Form/EditPaymentForm.jsx";
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

// ---------------- Payment Management Page ----------------
const Payment = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { 
    paymentList, 
    totalPages, 
    fetchPaymentList, 
    createPayment, 
    updatePayment, 
    deletePayment 
  } = usePayment();

  // Fetch data whenever page changes
  useEffect(() => {
    fetchPaymentList(currentPage);
  }, [currentPage]);

  const handleRefresh = () => {
    fetchPaymentList(currentPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      await deletePayment(id);
      handleRefresh();
    }
  };

  const paymentColumns = [
    { header: "ID", key: "PAYMENTID" },
    { header: "Amount", key: "PAYMENTAMOUNT" },
    { header: "Method", key: "PAYMENTMETHOD" },
    { header: "Date", key: "PAYMENTDATE" },
    { header: "Status", key: "PAYMENTSTATUS" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => { setSelectedPayment(row); setIsEditOpen(true); }}>✏️</button>
          <button className="delete" onClick={() => handleDelete(row.PAYMENTID)}>🗑</button>
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
              + Add Payment
            </button>
          </div>
          
          <div className="default-content">
            <h2>Payment Management</h2>
            <Table columns={paymentColumns} data={paymentList} />
            
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
      <Modal isOpen={isAddOpen} title="Add New Payment" onClose={() => setIsAddOpen(false)}>
        <AddPaymentForm 
          onCancel={() => setIsAddOpen(false)} 
          onCreate={async (data) => { 
            await createPayment(data); 
            setIsAddOpen(false); 
            handleRefresh(); 
          }} 
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} title="Edit Payment" onClose={() => setIsEditOpen(false)}>
        <EditPaymentForm 
          payment={selectedPayment} 
          onCancel={() => setIsEditOpen(false)} 
          onSave={async (data) => { 
            await updatePayment(data); 
            setIsEditOpen(false); 
            handleRefresh(); 
          }} 
        />
      </Modal>
    </div>
  );
};

export default Payment;