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
    const closeSidebar  = () => setIsSidebarOpen(false);

    const {
        staffList,
        driverList,
        nonDriverList,
        fetchStaffList,
        fetchDriverList,
        fetchNonDriverList,
        updateStaff,
        deleteStaff,
        createStaff,
    } = useStaff();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    const refreshAll = () => {
        fetchStaffList();
        fetchDriverList();
        fetchNonDriverList();
    };

    useEffect(() => {
        refreshAll();
    }, []);

    // ── Columns shared between all three tables ──────────────────────────────
    const makeColumns = () => [
        { header: "ID",                  key: "STAFFID" },
        { header: "Name",                key: "STAFFNAME" },
        { header: "Email",               key: "STAFFEMAIL" },
        { header: "Phone No",            key: "STAFFPHONENUM" },
        { header: "IC",                  key: "STAFFIC" },
        { header: "Position",            key: "STAFFPOSITION" },
        { header: "Supervisor",          key: "SUPERVISOR_NAME" },
        { header: "Driver ID",           key: "DRIVERID" },       // null for non-drivers
        { header: "License Type",        key: "LICENSETYPE" },    // null for non-drivers
        {
            header: "Actions",
            key: "actions",
            render: (row) => (
                <div className="table-actions">
                    <button onClick={() => handleEdit(row)}>✏️</button>
                    <button className="delete" onClick={() => handleDelete(row.STAFFID)}>🗑</button>
                </div>
            )
        }
    ];

    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setIsEditOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this staff?")) return;
        await deleteStaff(id);
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
                        {/* ── All Staff ── */}
                        <h2>All Staff</h2>
                        <Table columns={makeColumns()} data={staffList} />

                        {/* ── Drivers (Staff subtype with DRIVER row) ── */}
                        <h2>Drivers</h2>
                        <Table columns={makeColumns()} data={driverList} />

                        {/* ── Non-Driver Staff ── */}
                        <h2>Non-Driver Staff</h2>
                        <Table columns={makeColumns()} data={nonDriverList} />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} title="Edit Staff" onClose={() => setIsEditOpen(false)}>
                <EditStaffForm
                    staff={selectedStaff}
                    staffList={staffList}
                    onCancel={() => setIsEditOpen(false)}
                    onSave={async (updatedStaff) => {
                        await updateStaff(updatedStaff);
                        setIsEditOpen(false);
                        refreshAll();
                    }}
                />
            </Modal>

            {/* Add Modal */}
            <Modal isOpen={isAddOpen} title="Create Staff" onClose={() => setIsAddOpen(false)}>
                <AddStaffForm
                    staffList={staffList}
                    onCancel={() => setIsAddOpen(false)}
                    onCreate={async (newStaff) => {
                        await createStaff(newStaff);
                        setIsAddOpen(false);
                        refreshAll();
                    }}
                />
            </Modal>
        </div>
    );
};

export default Staff;