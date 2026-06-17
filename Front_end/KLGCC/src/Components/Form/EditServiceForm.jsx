import { useState, useEffect } from "react";

const EditEquipmentForm = ({ equipment, bookingList = [], onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    EQUIPMENT_TYPE: "",
    FEE: "",
    BOOKING_ID: "",
    CUSTOMER_NAME: ""
  });

  useEffect(() => {
    if (equipment) {
      const selected = bookingList.find(b => b.BOOKING_ID === equipment.BOOKING_ID);
      setFormData({
        EQUIPMENT_TYPE: equipment.EQUIPMENT_TYPE,
        FEE: equipment.FEE,
        BOOKING_ID: equipment.BOOKING_ID,
        CUSTOMER_NAME: selected ? selected.CUSTOMER_NAME : equipment.CUSTOMER_NAME
      });
    }
  }, [equipment, bookingList]);

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

  return (
    <form className="edit-staff-form" onSubmit={(e) => {
      e.preventDefault();
      onSave({ 
        ...equipment, 
        ...formData, 
        FEE: Number(formData.FEE), 
        BOOKING_ID: Number(formData.BOOKING_ID) 
      });
    }}>
      <label>Type
        <input name="EQUIPMENT_TYPE" value={formData.EQUIPMENT_TYPE} onChange={handleChange} />
      </label>
      <label>Fee
        <input type="number" name="FEE" value={formData.FEE} onChange={handleChange} />
      </label>
      <label>Booking
        <select name="BOOKING_ID" value={formData.BOOKING_ID} onChange={handleChange}>
          {bookingList.map(b => (
            <option key={b.BOOKING_ID} value={b.BOOKING_ID}>
              ID: {b.BOOKING_ID} - {b.CUSTOMER_NAME}
            </option>
          ))}
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

export default EditEquipmentForm;