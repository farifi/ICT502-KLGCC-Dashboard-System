import { useState, useEffect } from "react";
import { useBooking } from "../API Contexts Folder/BookingContext";

import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import AddBookingForm from "../Components/Form/AddBookingForm.jsx";
import EditBookingForm from "../Components/Form/EditBookingForm.jsx";
import API from "../Api.jsx";

import "./Pages CSS files/DefaultTheme.css";

// ---------------- Standardized Pagination Component ----------------
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

// ---------------- Date Formatting Helpers ----------------
const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// ---------------- Booking Page ----------------
const Booking = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const {
    customerList,
    teeTimeList,
    fetchCustomerList,
    fetchTeeTimeList,
    createBooking,
    updateBooking,
    deleteBooking,
    confirmBooking,
    cancelBooking,
  } = useBooking();

  // --- Bookings State (Pending, Confirmed, Cancelled) ---
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);

  // --- Pagination States ---
  const [pendingPage, setPendingPage] = useState(1);
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [cancelledPage, setCancelledPage] = useState(1);

  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [confirmedTotalPages, setConfirmedTotalPages] = useState(1);
  const [cancelledTotalPages, setCancelledTotalPages] = useState(1);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookingColumns = [
    { header: "ID", key: "BOOKING_ID" },
    { header: "Booking Date", key: "BOOKING_DATE", render: row => formatDateTime(row.BOOKING_DATE) },
    { header: "Status", key: "STATUS" },
    { header: "Total Price (RM)", key: "TOTAL_PRICE", render: row => `RM ${Number(row.TOTAL_PRICE).toFixed(2)}` },
    { header: "Customer Name", key: "CUSTOMER_NAME" },
    { header: "Course Name", key: "COURSE_NAME" },
    { header: "Start Time", key: "START_TIME", render: row => formatTime(row.START_TIME) },
    { header: "End Time", key: "END_TIME", render: row => formatTime(row.END_TIME) },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button className="delete" onClick={() => handleDelete(row.BOOKING_ID)}>🗑</button>
          {row.STATUS === "PENDING" && (
            <>
              <button onClick={() => handleConfirm(row.BOOKING_ID)}>✅</button>
              <button onClick={() => handleCancel(row.BOOKING_ID)}>❌</button>
            </>
          )}
        </div>
      )
    }
  ];

  const fetchBookings = async (status, page, setData, setTotalPages) => {
    try {
      const res = await API.get("/api/booking/bookingList", {
        params: { status, page, limit: 5 }
      });
      setData(res.data.bookings || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(`Booking fetch error (${status}):`, err);
      setData([]);
      setTotalPages(1);
    }
  };

  // ✅ Refresh all tables together so bookings move visually
  const refreshAllBookings = () => {
    fetchBookings("PENDING", pendingPage, setPendingBookings, setPendingTotalPages);
    fetchBookings("CONFIRMED", confirmedPage, setConfirmedBookings, setConfirmedTotalPages);
    fetchBookings("CANCELLED", cancelledPage, setCancelledBookings, setCancelledTotalPages);
  };

  useEffect(() => {
    fetchCustomerList();
    fetchTeeTimeList();
  }, []);

  // Listen for individual page changes
  useEffect(() => { fetchBookings("PENDING", pendingPage, setPendingBookings, setPendingTotalPages); }, [pendingPage]);
  useEffect(() => { fetchBookings("CONFIRMED", confirmedPage, setConfirmedBookings, setConfirmedTotalPages); }, [confirmedPage]);
  useEffect(() => { fetchBookings("CANCELLED", cancelledPage, setCancelledBookings, setCancelledTotalPages); }, [cancelledPage]);

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    await deleteBooking(id);
    refreshAllBookings();
  };

  const handleConfirm = async (id) => {
    await confirmBooking(id);
    refreshAllBookings();
  };

  const handleCancel = async (id) => {
    await cancelBooking(id);
    refreshAllBookings();
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
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>+ Add Booking</button>
          </div>

          <div className="default-content">
            <h2 className="section-title">Pending Bookings</h2>
            <Table columns={bookingColumns} data={pendingBookings} />
            <Pagination currentPage={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />

            <h2 className="section-title">Confirmed Bookings</h2>
            <Table columns={bookingColumns} data={confirmedBookings} />
            <Pagination currentPage={confirmedPage} totalPages={confirmedTotalPages} onPageChange={setConfirmedPage} />

            <h2 className="section-title cancelled-title">Cancelled Bookings</h2>
            <Table columns={bookingColumns} data={cancelledBookings} />
            <Pagination currentPage={cancelledPage} totalPages={cancelledTotalPages} onPageChange={setCancelledPage} />
          </div>
        </div>
      </div>

      <Modal isOpen={isAddOpen} title="Add Booking" onClose={() => setIsAddOpen(false)}>
        <AddBookingForm
          customerList={customerList}
          teeTimeList={teeTimeList}
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (newBooking) => {
            await createBooking(newBooking);
            setIsAddOpen(false);
            refreshAllBookings();
          }}
        />
      </Modal>

      <Modal isOpen={isEditOpen} title="Edit Booking" onClose={() => setIsEditOpen(false)}>
        <EditBookingForm
          booking={selectedBooking}
          customerList={customerList}
          teeTimeList={teeTimeList}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (updatedBooking) => {
            await updateBooking(updatedBooking);
            setIsEditOpen(false);
            refreshAllBookings();
          }}
        />
      </Modal>
    </div>
  );
};

export default Booking;