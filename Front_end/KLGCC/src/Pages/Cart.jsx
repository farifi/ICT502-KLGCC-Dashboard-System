import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import EditCartForm from "../Components/Form/EditCartForm.jsx";
import AddCartForm from "../Components/Form/AddCartForm.jsx";
import { useCart } from "../API Contexts Folder/CartContext.jsx";
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

// ---------------- Cart Management Page ----------------
const Cart = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCart, setSelectedCart] = useState(null);
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Set to 5 as requested

  const { 
    cartWithBookingList, 
    fetchCartList, 
    fetchCartWithBookingList, 
    createCart, 
    updateCart, 
    deleteCart 
  } = useCart();

  useEffect(() => {
    fetchCartList();
    fetchCartWithBookingList();
  }, [fetchCartList, fetchCartWithBookingList]);

  // --- Frontend Slicing Logic ---
  const totalPages = Math.ceil(cartWithBookingList.length / itemsPerPage);
  const currentData = cartWithBookingList.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const columns = [
    { header: "ID", key: "CART_ID" },
    { header: "Cart #", key: "CART_NUMBER" },
    { header: "Fee", key: "RENTAL_FEE", render: (r) => `RM ${Number(r.RENTAL_FEE).toFixed(2)}` },
    { header: "Booking Date", key: "BOOKING_DATE" },
    { header: "Customer", key: "CUSTOMER_NAME" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => { setSelectedCart(row); setIsEditOpen(true); }}>✏️</button>
          <button className="delete" onClick={() => confirm("Delete this cart?") && deleteCart(row.CART_ID)}>🗑</button>
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
          <Header toggleSidebar={toggleSidebar} />
          <div className="table-header">
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>+ Add Cart</button>
          </div>
          <div className="default-content">
            <h2>Cart Inventory</h2>
            {/* We map currentData to include 'id' for the Table component's keys */}
            <Table 
              title="Cart Management" 
              columns={columns} 
              data={currentData.map(item => ({...item, id: item.CART_ID}))} 
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

      <Modal isOpen={isEditOpen} title="Edit Cart" onClose={() => setIsEditOpen(false)}>
        <EditCartForm 
          cart={selectedCart} 
          onCancel={() => setIsEditOpen(false)} 
          onSave={async (d) => {
            const success = await updateCart(d);
            if (success) setIsEditOpen(false);
          }} 
        />
      </Modal>

      <Modal isOpen={isAddOpen} title="Add Cart" onClose={() => setIsAddOpen(false)}>
        <AddCartForm 
          onCancel={() => setIsAddOpen(false)} 
          onCreate={async (d) => {
            const success = await createCart(d);
            if (success) setIsAddOpen(false);
          }} 
        />
      </Modal>
    </div>
  );
};

export default Cart;