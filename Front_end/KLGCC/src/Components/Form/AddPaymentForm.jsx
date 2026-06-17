import { useState } from "react";
import "../Components CSS files/AddStaffForm.css";

const AddPaymentForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    PAYMENTAMOUNT: "",
    PAYMENTMETHOD: "",
    PAYMENTDATE: "",
    PAYMENTSTATUS: ""
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
    // Ensure PAYMENTAMOUNT is sent as a number for the database
    const dataToSubmit = {
      ...formData,
      PAYMENTAMOUNT: parseFloat(formData.PAYMENTAMOUNT)
    };
    onCreate(dataToSubmit);
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Amount
        <input
          type="number"
          step="0.01"
          name="PAYMENTAMOUNT"
          value={formData.PAYMENTAMOUNT}
          onChange={handleChange}
          placeholder="e.g., 49.99"
          required
        />
      </label>

      <label>
        Payment Method
        <select
          name="PAYMENTMETHOD"
          value={formData.PAYMENTMETHOD}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Method --</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Online">Online</option>
        </select>
      </label>

      <label>
        Payment Date
        <input
          type="date"
          name="PAYMENTDATE"
          value={formData.PAYMENTDATE}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Status
        <select 
          name="PAYMENTSTATUS" 
          value={formData.PAYMENTSTATUS} 
          onChange={handleChange}
          required
        >
          <option value="">-- Select Status --</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </label>

      <div className="modal-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Add Payment
        </button>
      </div>
    </form>
  );
};

export default AddPaymentForm;