import { useState } from "react";
import "../Components CSS files/AddStaffForm.css";

const AddStaffForm = ({ staffList, onCancel, onCreate }) => {
    const [formData, setFormData] = useState({
        staffName:     "",
        staffEmail:    "",
        staffPhoneNum: "",
        staffIC:       "",
        staffPosition: "",
        staffPassword: "",
        supervisorID:  "",
        supervisorName: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "supervisorID") {
            const supervisor = staffList.find(s => s.STAFFID === Number(value));
            setFormData(prev => ({
                ...prev,
                supervisorID:   value,
                supervisorName: supervisor ? supervisor.STAFFNAME : ""
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate({
            staffName:     formData.staffName,
            staffEmail:    formData.staffEmail,
            staffPhoneNum: formData.staffPhoneNum,
            staffIC:       formData.staffIC,
            staffPosition: formData.staffPosition,
            staffPassword: formData.staffPassword,
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
                Password
                <input name="staffPassword" type="password" value={formData.staffPassword} onChange={handleChange} required />
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
                <select name="supervisorID" value={formData.supervisorID} onChange={handleChange}>
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
                <button type="submit">Add</button>
            </div>
        </form>
    );
};

export default AddStaffForm;