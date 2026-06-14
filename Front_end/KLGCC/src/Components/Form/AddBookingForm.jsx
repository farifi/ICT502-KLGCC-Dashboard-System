import { useState } from "react";
import "../Components CSS files/AddBookingForm.css";

const AddBookingForm = ({ customerList = [], teeTimeList = [], onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    CUSTOMER_ID: "",
    CUSTOMER_NAME: "",
    TEE_TIME_ID: "",
    BOOKING_DATE: "",
    STATUS: "PENDING",
    TOTAL_PRICE: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "CUSTOMER_ID") {
      const customer = customerList.find(c => c.CUSTOMER_ID === Number(value));
      setFormData(prev => ({
        ...prev,
        CUSTOMER_ID: value,
        CUSTOMER_NAME: customer ? customer.FULL_NAME : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  onCreate({
    CUSTOMER_ID: Number(formData.CUSTOMER_ID),
    TEE_TIME_ID: Number(formData.TEE_TIME_ID),
    BOOKING_DATE: formData.BOOKING_DATE,
    STATUS: formData.STATUS.toUpperCase(),
    TOTAL_PRICE: Number(formData.TOTAL_PRICE)
  });
};


  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Customer
        <select name="CUSTOMER_ID" value={formData.CUSTOMER_ID} onChange={handleChange} required>
          <option value="">-- Select Customer --</option>
          {customerList.map(c => (
            <option key={c.CUSTOMER_ID} value={c.CUSTOMER_ID}>{c.FULL_NAME}</option>
          ))}
        </select>
      </label>

      <label>
        Tee Time
        <select name="TEE_TIME_ID" value={formData.TEE_TIME_ID} onChange={handleChange} required>
          <option value="">-- Select Tee Time --</option>
          {teeTimeList.map(t => (
            <option key={t.TEE_TIME_ID} value={t.TEE_TIME_ID}>
              {t.COURSE_NAME} | {new Date(t.START_TIME).toLocaleTimeString()} - {new Date(t.END_TIME).toLocaleTimeString()}
            </option>
          ))}
        </select>
      </label>

      <label>
        Booking Date
        <input type="date" name="BOOKING_DATE" value={formData.BOOKING_DATE} onChange={handleChange} required />
      </label>

      <label>
        Status
        <select name="STATUS" value={formData.STATUS} onChange={handleChange}>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
        </select>
      </label>

      <label>
        Price (RM)
        <input type="number" name="TOTAL_PRICE" value={formData.TOTAL_PRICE} onChange={handleChange} min="0" required />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Booking</button>
      </div>
    </form>
  );
};

export default AddBookingForm;
