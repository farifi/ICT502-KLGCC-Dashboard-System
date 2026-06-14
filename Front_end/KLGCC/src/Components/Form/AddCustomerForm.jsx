import { useState } from "react";
import "../Components CSS files/AddStaffForm.css"; 

const AddCustomerForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    FULL_NAME: "",
    EMAIL: "",
    PHONE_NUMBER: "",
    MEMBERSHIP_TYPE: "" 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate({
      FULL_NAME: formData.FULL_NAME,
      EMAIL: formData.EMAIL,
      PHONE_NUMBER: formData.PHONE_NUMBER,
      MEMBERSHIP_TYPE: formData.MEMBERSHIP_TYPE || null 
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Full Name
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
        Phone Number
        <input
          name="PHONE_NUMBER"
          value={formData.PHONE_NUMBER}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Membership Type (Optional)
        <select
          name="MEMBERSHIP_TYPE"
          value={formData.MEMBERSHIP_TYPE}
          onChange={handleChange}
        >
          <option value="">Walk-in</option>
          <option value="GOLD">Gold</option>
          <option value="SILVER">Silver</option>
          <option value="BRONZE">Bronze</option>
        </select>
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add</button>
      </div>
    </form>
  );
};

export default AddCustomerForm;
