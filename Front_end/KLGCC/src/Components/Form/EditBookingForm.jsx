import { useState, useEffect } from "react";
import "../Components CSS files/EditBookingForm.css";

const EditBookingForm = ({ booking, customerList = [], teeTimeList = [], onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    CUSTOMER_ID: "",
    TEE_TIME_ID: "",
    BOOKING_DATE: "",
    STATUS: "",
    TOTAL_PRICE: ""
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        CUSTOMER_ID: booking.CUSTOMER_ID || "",
        TEE_TIME_ID: booking.TEE_TIME_ID || "",
        BOOKING_DATE: booking.BOOKING_DATE ? booking.BOOKING_DATE.split("T")[0] : "",
        STATUS: booking.STATUS || "PENDING",
        TOTAL_PRICE: booking.TOTAL_PRICE || ""
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...booking,
      ...formData,
      CUSTOMER_ID: Number(formData.CUSTOMER_ID),
      TEE_TIME_ID: Number(formData.TEE_TIME_ID),
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Customer
        <select name="CUSTOMER_ID" value={formData.CUSTOMER_ID} onChange={handleChange} required>
          {customerList.map(c => <option key={c.CUSTOMER_ID} value={c.CUSTOMER_ID}>{c.FULL_NAME}</option>)}
        </select>
      </label>

      <label>Tee Time
        <select name="TEE_TIME_ID" value={formData.TEE_TIME_ID} onChange={handleChange} required>
          {teeTimeList.map(t => (
            <option key={t.TEE_TIME_ID} value={t.TEE_TIME_ID}>
              {t.COURSE_NAME} | {new Date(t.START_TIME).toLocaleTimeString()}
            </option>
          ))}
        </select>
      </label>

      <label>Booking Date
        <input type="date" name="BOOKING_DATE" value={formData.BOOKING_DATE} onChange={handleChange} required />
      </label>

      <label>Status
        <select name="STATUS" value={formData.STATUS} onChange={handleChange} required>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </label>

      <label>Price (RM)
        <input type="number" name="TOTAL_PRICE" value={formData.TOTAL_PRICE} onChange={handleChange} required />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Booking</button>
      </div>
    </form>
  );
};

export default EditBookingForm;