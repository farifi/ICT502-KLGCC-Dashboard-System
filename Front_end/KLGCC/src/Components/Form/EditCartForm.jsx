import { useState, useEffect } from "react";
import { useBooking } from "../../API Contexts Folder/BookingContext.jsx";

const EditCartForm = ({ cart, onCancel, onSave }) => {
  const [formData, setFormData] = useState({ ...cart });
  const { bookingList, fetchBookingListForEquipment } = useBooking();

  useEffect(() => { fetchBookingListForEquipment(); }, [fetchBookingListForEquipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) onCancel();
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Cart Number
        <input value={formData.CART_NUMBER} onChange={e => setFormData({...formData, CART_NUMBER: e.target.value})} />
      </label>
      <label>Fee (RM)
        <input type="number" step="0.01" value={formData.RENTAL_FEE} onChange={e => setFormData({...formData, RENTAL_FEE: e.target.value})} />
      </label>
      <label>Change Customer
        <select value={formData.BOOKING_ID || ""} onChange={e => setFormData({...formData, BOOKING_ID: e.target.value})}>
          <option value="">-- No Booking --</option>
          {bookingList.map(b => (
            <option key={b.BOOKING_ID} value={b.BOOKING_ID}>
              {b.CUSTOMER_NAME} (#{b.BOOKING_ID})
            </option>
          ))}
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
};
export default EditCartForm;