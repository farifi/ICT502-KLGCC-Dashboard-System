import { useState, useEffect } from "react";
import { useBooking } from "../../API Contexts Folder/BookingContext.jsx";

const AddCartForm = ({ onCancel, onCreate }) => {
  const [form, setForm] = useState({ CART_NUMBER: "", RENTAL_FEE: "", BOOKING_ID: "" });
  const { bookingList, fetchBookingListForEquipment } = useBooking();

  useEffect(() => {
    fetchBookingListForEquipment();
  }, [fetchBookingListForEquipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onCreate(form);
    if (success) onCancel();
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Cart Number
        <input value={form.CART_NUMBER} onChange={e => setForm({...form, CART_NUMBER: e.target.value})} required />
      </label>
      <label>Rental Fee (RM)
        <input type="number" step="0.01" value={form.RENTAL_FEE} onChange={e => setForm({...form, RENTAL_FEE: e.target.value})} required />
      </label>
      <label>Assign Customer
        <select value={form.BOOKING_ID} onChange={e => setForm({...form, BOOKING_ID: e.target.value})}>
          <option value="">-- No Booking Assigned --</option>
          {bookingList.map((b) => (
            <option key={b.BOOKING_ID} value={b.BOOKING_ID}>
              {b.CUSTOMER_NAME} (Booking #{b.BOOKING_ID})
            </option>
          ))}
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Cart</button>
      </div>
    </form>
  );
};
export default AddCartForm;