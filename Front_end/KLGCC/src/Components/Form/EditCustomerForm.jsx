import { useState, useEffect } from "react";
import "../Components CSS files/EditStaffForm.css"; 

const EditCustomerForm = ({ customer, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    FULL_NAME: "",
    EMAIL: "",
    PHONE_NUMBER: ""
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        FULL_NAME: customer.FULL_NAME || "",
        EMAIL: customer.EMAIL || "",
        PHONE_NUMBER: customer.PHONE_NUMBER || ""
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer) return;

    onSave({
      CUSTOMER_ID: customer.CUSTOMER_ID,
      ...formData
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

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

export default EditCustomerForm;
