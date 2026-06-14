import { useState } from "react";
import "../Components CSS files/AddStaffForm.css";

const AddStaffForm = ({ staffList, onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    FULL_NAME: "",
    EMAIL: "",
    PHONE: "",
    SUPERVISOR_ID: "",
    SUPERVISOR_NAME: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "SUPERVISOR_ID") {
      const supervisor = staffList.find(
        s => s.STAFF_ID === Number(value)
      );

      setFormData(prev => ({
        ...prev,
        SUPERVISOR_ID: value,
        SUPERVISOR_NAME: supervisor ? supervisor.STAFF_NAME : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    onCreate({
      ...formData,
      SUPERVISOR_ID: formData.SUPERVISOR_ID || null
    });
  };
  

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input
          name="FULL_NAME"
          value={formData.FULL_NAME}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Email
        <input
          name="EMAIL"
          value={formData.EMAIL}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Phone
        <input
          name="PHONE"
          value={formData.PHONE}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Supervisor
        <select
          name="SUPERVISOR_ID"
          value={formData.SUPERVISOR_ID}
          onChange={handleChange}
        >
          <option value="">-- None --</option>
          {staffList.map(s => (
            <option key={s.STAFF_ID} value={s.STAFF_ID}>
              {s.STAFF_NAME} (ID: {s.STAFF_ID})
            </option>
          ))}
        </select>
      </label>

      <label>
        Supervisor Name
        <input
            name="SUPERVISOR_NAME"
            value={formData.SUPERVISOR_NAME}
            readOnly
          />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit">
          Add
        </button>
      </div>
    </form>
  );
};

export default AddStaffForm;
