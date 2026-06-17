import { useState } from "react";
import "../Components CSS files/AddStaffForm.css";

const AddCustomerForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    CUSTNAME: "",
    CUSTPHONENUM: "",
    CUSTIC: "",
    CUSTEMAIL: "",
    CUSTLICENSENO: "",
    CUSTADDRESS: "",
    CUSTPASSWORD: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onCreate(formData);
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Customer Name
        <input
          type="text"
          name="CUSTNAME"
          value={formData.CUSTNAME}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Phone Number
        <input
          type="text"
          name="CUSTPHONENUM"
          value={formData.CUSTPHONENUM}
          onChange={handleChange}
        />
      </label>

      <label>
        IC Number
        <input
          type="text"
          name="CUSTIC"
          value={formData.CUSTIC}
          onChange={handleChange}
        />
      </label>

      <label>
        Email
        <input
          type="email"
          name="CUSTEMAIL"
          value={formData.CUSTEMAIL}
          onChange={handleChange}
        />
      </label>

      <label>
        License Number
        <input
          type="text"
          name="CUSTLICENSENO"
          value={formData.CUSTLICENSENO}
          onChange={handleChange}
        />
      </label>

      <label>
        Address
        <textarea
          name="CUSTADDRESS"
          value={formData.CUSTADDRESS}
          onChange={handleChange}
          rows="3"
        />
      </label>

      <label>
        Password
        <input
          type="password"
          name="CUSTPASSWORD"
          value={formData.CUSTPASSWORD}
          onChange={handleChange}
          required
        />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit">
          Add Customer
        </button>
      </div>
    </form>
  );
};

export default AddCustomerForm;