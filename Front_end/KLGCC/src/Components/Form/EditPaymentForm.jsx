import { useState, useEffect } from "react";
import "../Components CSS files/AddStaffForm.css";

const EditPaymentForm = ({ payment, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    PAYMENTAMOUNT: "",
    PAYMENTMETHOD: "",
    PAYMENTDATE: "",
    PAYMENTSTATUS: ""
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        PAYMENTAMOUNT: payment.PAYMENTAMOUNT || "",
        PAYMENTMETHOD: payment.PAYMENTMETHOD || "",
        PAYMENTDATE: payment.PAYMENTDATE || "",
        PAYMENTSTATUS: payment.PAYMENTSTATUS || ""
      });
    }
  }, [payment]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <form className="edit-staff-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...payment, ...formData }); }}>
      <label>Amount<input type="number" step="0.01" name="PAYMENTAMOUNT" value={formData.PAYMENTAMOUNT} onChange={handleChange} required /></label>
      <label>Method<input name="PAYMENTMETHOD" value={formData.PAYMENTMETHOD} onChange={handleChange} required /></label>
      <label>Date<input type="date" name="PAYMENTDATE" value={formData.PAYMENTDATE} onChange={handleChange} required /></label>
      <label>Status
        <select name="PAYMENTSTATUS" value={formData.PAYMENTSTATUS} onChange={handleChange} required>
          <option value="">-- Select Status --</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
};

export default EditPaymentForm;