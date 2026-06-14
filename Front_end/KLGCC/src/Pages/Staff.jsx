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
    
    const { staffList, fetchStaffList, updateStaff, deleteStaff, createStaff } = useStaff();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    useEffect(() => {
        fetchStaffList();
    }, []);

    const staffColumns = [
        { header: "ID", key: "STAFF_ID" },
        { header: "Name", key: "STAFF_NAME" },
        { header: "Email", key: "EMAIL" },
        { header: "Phone No", key: "PHONE" },
        { header: "Supervisor ID", key: "SUPERVISOR_ID" },
        { header: "Supervisor Name", key: "SUPERVISOR_NAME" },
        { 
            header: "Actions",
            key: "actions",
            render: (row) => (
                <div className="table-actions">
                    <button onClick={() => handleEdit(row)}>✏️</button>
                    <button className="delete" onClick={() => handleDelete(row.STAFF_ID)}>🗑</button>
                </div>
            )
        }
    ];

    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setIsEditOpen(true);
    }

    const handleDelete = (id) => {
        if (!confirm("Are you sure you want to delete this staff?")) return;
        deleteStaff(id);
    }

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
                        <button 
                            className="add-btn" 
                            onClick={() => setIsAddOpen(true)}
                        >+ Add Staff </button>
                    </div>

                    <div className="default-content">
                        <Table title="Staff List" columns={staffColumns} data={staffList}/>
                        
                    </div>
                </div>
                
            </div>
            <Modal isOpen={isEditOpen} title="Edit Staff" onClose={() => setIsEditOpen(false)}>
                <EditStaffForm
                    staff={selectedStaff}
                    staffList={staffList}  // <-- pass it here
                    onCancel={() => setIsEditOpen(false)}
                    onSave={(updatedStaff) => {
                        updateStaff(updatedStaff);
                        setIsEditOpen(false);
                    }}
                />
            </Modal>
            <Modal
                isOpen={isAddOpen}
                title="Create Staff"
                onClose={() => setIsAddOpen(false)}
                >
                <AddStaffForm
                        staffList={staffList}
                        onCancel={() => setIsAddOpen(false)}
                        onCreate={(newStaff) => {
                        createStaff(newStaff);
                        setIsAddOpen(false);
                    }}
                />
            </Modal>
        </div>
    );
};

export default Staff;