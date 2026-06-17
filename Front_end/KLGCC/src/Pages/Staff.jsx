import { useState, useEffect } from "react";
import { useStaff } from "../API Contexts Folder/StaffContext.jsx";

import Sidebar from "../Components/Sidebar.jsx";
import Header from "../Components/Header.jsx";
import Table from "../Components/Table.jsx";
import Modal from "../Components/Modal.jsx";
import EditStaffForm from "../Components/Form/EditStaffForm.jsx";
import AddStaffForm from "../Components/Form/AddStaffForms.jsx";

import "./Pages CSS files/DefaultTheme.css";

const Staff = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const {
    staffList,
    driverList,
    fetchStaffList,
    fetchDriverList,
    createStaff,
    updateStaff,
    deleteStaff
  } = useStaff();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  useEffect(() => {
    fetchStaffList();
    fetchDriverList();
  }, []);

  const staffColumns = [
    { header: "ID", key: "STAFFID" },
    { header: "Name", key: "STAFFNAME" },
    { header: "Email", key: "STAFFEMAIL" },
    { header: "Phone", key: "STAFFPHONENUM" },
    { header: "IC", key: "STAFFIC" },
    { header: "Position", key: "STAFFPOSITION" },
    { header: "Supervisor", key: "SUPERVISOR_NAME" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button onClick={() => handleDelete(row.STAFFID)}>🗑</button>
        </div>
      )
    }
  ];

  const driverColumns = [
    { header: "Staff ID", key: "STAFFID" },
    { header: "Driver ID", key: "DRIVERID" },
    { header: "Name", key: "STAFFNAME" },
    { header: "Phone", key: "STAFFPHONENUM" },
    { header: "License Type", key: "LICENSETYPE" }
  ];

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setIsEditOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this staff?")) return;
    await deleteStaff(id);

    fetchStaffList();
    fetchDriverList();
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
            <button className="add-btn" onClick={() => setIsAddOpen(true)}>
              + Add Staff
            </button>
          </div>

          <div className="default-content">

            {/* ================= STAFF ================= */}
            <h2>Staff List</h2>
            <Table columns={staffColumns} data={staffList} />

            <div style={{ marginTop: "20px" }} />

            {/* ================= DRIVER ================= */}
            <h2>Driver List</h2>
            <Table columns={driverColumns} data={driverList} />

          </div>
        </div>
      </div>

      {/* ADD STAFF */}
      <Modal isOpen={isAddOpen} title="Add Staff" onClose={() => setIsAddOpen(false)}>
        <AddStaffForm
          onCancel={() => setIsAddOpen(false)}
          onCreate={async (data) => {
            await createStaff(data);
            setIsAddOpen(false);

            fetchStaffList();
            fetchDriverList();
          }}
        />
      </Modal>

      {/* EDIT STAFF */}
      <Modal isOpen={isEditOpen} title="Edit Staff" onClose={() => setIsEditOpen(false)}>
        <EditStaffForm
          staff={selectedStaff}
          onCancel={() => setIsEditOpen(false)}
          onSave={async (data) => {
            await updateStaff(data);
            setIsEditOpen(false);

            fetchStaffList();
            fetchDriverList();
          }}
        />
      </Modal>

    </div>
  );
};

export default Staff;