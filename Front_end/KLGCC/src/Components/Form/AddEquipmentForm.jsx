import { useState } from "react";
import "../Components CSS files/AddStaffForm.css";

const AddEquipmentForm = ({ bookingList = [], onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    EQUIPMENT_TYPE: "",
    FEE: "",
    BOOKING_ID: "",
    CUSTOMER_NAME: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "BOOKING_ID") {
      const selected = bookingList.find(b => b.BOOKING_ID === Number(value));
      setFormData(prev => ({
        ...prev,
        BOOKING_ID: value,
        CUSTOMER_NAME: selected ? selected.CUSTOMER_NAME : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      EQUIPMENT_TYPE: formData.EQUIPMENT_TYPE,
      FEE: Number(formData.FEE),
      BOOKING_ID: formData.BOOKING_ID ? Number(formData.BOOKING_ID) : null
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Equipment Type
        <input name="EQUIPMENT_TYPE" value={formData.EQUIPMENT_TYPE} onChange={handleChange} required />
      </label>

      <label>Fee (RM)
        <input type="number" name="FEE" value={formData.FEE} onChange={handleChange} required />
      </label>

      <label>Booking
        <select name="BOOKING_ID" value={formData.BOOKING_ID} onChange={handleChange} required>
          <option value="">-- Select Booking --</option>
          {bookingList.map(b => (
            <option key={b.BOOKING_ID} value={b.BOOKING_ID}>
              ID: {b.BOOKING_ID} - {b.CUSTOMER_NAME}
            </option>
          ))}
        </select>
      </label>

      <label>Customer Name
        <input value={formData.CUSTOMER_NAME} readOnly style={{ backgroundColor: "#f3f3f3" }} />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Equipment</button>
      </div>
    </form>
  );
};

export default AddEquipmentForm;