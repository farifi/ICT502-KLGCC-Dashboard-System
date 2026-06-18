import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import { usePayment } from "../API Contexts Folder/PaymentContext.jsx";
import AddPaymentForm from "../Components/Form/AddPaymentForm.jsx";
import EditPaymentForm from "../Components/Form/EditPaymentForm.jsx";
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

// ---------------- Payment Page ----------------
const Payment = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const {
    paymentList,
    totalPages,
    loading,
    fetchPaymentList,
    createPayment,
    updatePayment,
    deletePayment,
  } = usePayment();

  useEffect(() => {
    fetchPaymentList(currentPage);
  }, [currentPage]);

  const handleRefresh = () => fetchPaymentList(currentPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    await deletePayment(id);
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setIsEditOpen(true);
  };

  const pendingFailedList = paymentList.filter(
    (p) => p.PAYMENTSTATUS === "Pending" || p.PAYMENTSTATUS === "Failed"
  );

  const completedRefundedList = paymentList.filter(
    (p) => p.PAYMENTSTATUS === "Completed" || p.PAYMENTSTATUS === "Refunded"
  );

  const paymentColumns = [
    { header: "ID", key: "PAYMENTID" },
    {
      header: "Amount (RM)",
      key: "PAYMENTAMOUNT",
      render: (row) => `RM ${Number(row.PAYMENTAMOUNT).toFixed(2)}`,
    },
    { header: "Method", key: "PAYMENTMETHOD" },
    { header: "Date", key: "PAYMENTDATE" },
    { header: "Status", key: "PAYMENTSTATUS" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button
            className="delete"
            onClick={() => handleDelete(row.PAYMENTID)}
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
        <div
          className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
          <Sidebar closeSidebar={() => setIsSidebarOpen(false)} />
        </div>

        <div className="default-main">
          <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

          <div className="table-header">
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>
              + Add Payment
            </button>
          </div>

          <div className="default-content">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <h2 className="section-title">Pending / Failed Payments</h2>
                <Table columns={paymentColumns} data={pendingFailedList} />

                <h2 className="section-title cancelled-title">
                  Completed / Refunded Payments
                </h2>
                <Table columns={paymentColumns} data={completedRefundedList} />

                <div className="pagination-container">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        title="Add New Payment"
        onClose={() => setIsAddOpen(false)}
      >
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
      <Modal
        isOpen={isEditOpen}
        title="Edit Payment"
        onClose={() => setIsEditOpen(false)}
      >
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