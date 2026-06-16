import { useState, useEffect } from "react";
import "../Components CSS files/EditStaffForm.css";

const EditStaffForm = ({ staff, staffList, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        staffName:      "",
        staffEmail:     "",
        staffPhoneNum:  "",
        staffIC:        "",
        staffPosition:  "",
        supervisorID:   "",
        supervisorName: ""
    });

    useEffect(() => {
        if (staff) {
            setFormData({
                staffName:      staff.STAFFNAME      || "",
                staffEmail:     staff.STAFFEMAIL     || "",
                staffPhoneNum:  staff.STAFFPHONENUM  || "",
                staffIC:        staff.STAFFIC        || "",
                staffPosition:  staff.STAFFPOSITION  || "",
                supervisorID:   staff.SUPERVISORID   || "",
                supervisorName: staff.SUPERVISOR_NAME || ""
            });
        }
    }, [staff]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSupervisorChange = (e) => {
        const value = e.target.value;
        const selected = staffList.find(s => s.STAFFID === Number(value));
        setFormData(prev => ({
            ...prev,
            supervisorID:   value,
            supervisorName: selected ? selected.STAFFNAME : ""
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!staff) return;
        onSave({
            ...staff,
            staffName:     formData.staffName,
            staffEmail:    formData.staffEmail,
            staffPhoneNum: formData.staffPhoneNum,
            staffIC:       formData.staffIC,
            staffPosition: formData.staffPosition,
            supervisorID:  formData.supervisorID || null
        });
    };

    return (
        <form className="edit-staff-form" onSubmit={handleSubmit}>
            <label>
                Name
                <input name="staffName" value={formData.staffName} onChange={handleChange} required />
            </label>

            <label>
                Email
                <input name="staffEmail" value={formData.staffEmail} onChange={handleChange} required />
            </label>

            <label>
                Phone
                <input name="staffPhoneNum" value={formData.staffPhoneNum} onChange={handleChange} />
            </label>

            <label>
                IC Number
                <input name="staffIC" value={formData.staffIC} onChange={handleChange} />
            </label>

            <label>
                Position
                <input name="staffPosition" value={formData.staffPosition} onChange={handleChange} />
            </label>

            <label>
                Supervisor
                <select name="supervisorID" value={formData.supervisorID} onChange={handleSupervisorChange}>
                    <option value="">-- None --</option>
                    {staffList.map(s => (
                        <option key={s.STAFFID} value={s.STAFFID}>
                            {s.STAFFNAME} (ID: {s.STAFFID})
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Supervisor Name
                <input name="supervisorName" value={formData.supervisorName} readOnly />
            </label>

            <div className="modal-actions">
                <button type="button" onClick={onCancel}>Cancel</button>
                <button type="submit">Save</button>
            </div>
        </form>
    );
};

export default EditStaffForm;