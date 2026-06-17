import { useState, useEffect } from "react";
import "../Components CSS files/EditStaffForm.css";

const EditCustomerForm = ({ customer, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    CUSTNAME: "",
    CUSTPHONENUM: "",
    CUSTIC: "",
    CUSTEMAIL: "",
    CUSTLICENSENO: "",
    CUSTADDRESS: "",
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        CUSTNAME: customer.CUSTNAME || "",
        CUSTPHONENUM: customer.CUSTPHONENUM || "",
        CUSTIC: customer.CUSTIC || "",
        CUSTEMAIL: customer.CUSTEMAIL || "",
        CUSTLICENSENO: customer.CUSTLICENSENO || "",
        CUSTADDRESS: customer.CUSTADDRESS || "",
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!customer) return;

    onSave({
      CUSTID: customer.CUSTID,
      ...formData,
    });
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

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit">
          Save
        </button>
      </div>
    </form>
  );
};

export default EditCustomerForm;