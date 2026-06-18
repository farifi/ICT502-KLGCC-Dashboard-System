import { useState, useEffect } from "react";
import { useCar } from "../API Contexts Folder/CarContext.jsx";
import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import AddCarForm from "../Components/Form/AddCarForm.jsx";
import EditCarForm from "../Components/Form/EditCarForm.jsx";
import API from "../Api.jsx";
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

// ---------------- Car Page ----------------
const Car = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const [availableCars, setAvailableCars] = useState([]);
  const [unavailableCars, setUnavailableCars] = useState([]);
  const [availablePage, setAvailablePage] = useState(1);
  const [unavailablePage, setUnavailablePage] = useState(1);
  const [availableTotalPages, setAvailableTotalPages] = useState(1);
  const [unavailableTotalPages, setUnavailableTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { createCar, updateCar, deleteCar } = useCar();

  const fetchCars = async (status, page, setData, setTotalPages) => {
    setLoading(true);
    try {
      const res = await API.get("/api/car/carList", {
        params: { status, page, limit: 5 },
      });
      setData(res.data.cars || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(`Car fetch error (${status}):`, err);
      setData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const refreshAllCars = () => {
    fetchCars("AVAILABLE", availablePage, setAvailableCars, setAvailableTotalPages);
    fetchCars("UNAVAILABLE", unavailablePage, setUnavailableCars, setUnavailableTotalPages);
  };

  useEffect(() => {
    fetchCars("AVAILABLE", availablePage, setAvailableCars, setAvailableTotalPages);
  }, [availablePage]);

  useEffect(() => {
    fetchCars("UNAVAILABLE", unavailablePage, setUnavailableCars, setUnavailableTotalPages);
  }, [unavailablePage]);

  const handleEdit = (car) => {
    setSelectedCar(car);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    await deleteCar(id);
    refreshAllCars();
  };

  const carColumns = [
    { header: "ID", key: "CARID" },
    { header: "Type", key: "CARTYPE" },
    { header: "Brand", key: "CARBRAND" },
    { header: "Model", key: "CARMODEL" },
    { header: "Plate No", key: "CARPLATENO" },
    { header: "Colour", key: "CARCOLOUR" },
    { header: "Seats", key: "CARSEAT" },
    {
      header: "Fee (RM)",
      key: "CARFEE",
      render: (row) => `RM ${Number(row.CARFEE).toFixed(2)}`,
    },
    { header: "Status", key: "CARSTATUS" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button
            className="delete"
            onClick={() => handleDelete(row.CARID)}
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
              + Add Car
            </button>
          </div>

          <div className="default-content">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <h2 className="section-title">Available Cars</h2>
                <Table columns={carColumns} data={availableCars} />
                <Pagination
                  currentPage={availablePage}
                  totalPages={availableTotalPages}
                  onPageChange={setAvailablePage}
                />

                <h2 className="section-title cancelled-title">
                  Unavailable Cars
                </h2>
                <Table columns={carColumns} data={unavailableCars} />
                <Pagination
                  currentPage={unavailablePage}
                  totalPages={unavailableTotalPages}
                  onPageChange={setUnavailablePage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        title="Add Car"
        onClose={() => setIsAddOpen(false)}
      >
        <AddCarForm
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (newCar) => {
            await createCar(newCar);
            setIsAddOpen(false);
            refreshAllCars();
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        title="Edit Car"
        onClose={() => setIsEditOpen(false)}
      >
        <EditCarForm
          car={selectedCar}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (updatedCar) => {
            await updateCar(updatedCar);
            setIsEditOpen(false);
            refreshAllCars();
          }}
        />
      </Modal>
    </div>
  );
};

export default Car;