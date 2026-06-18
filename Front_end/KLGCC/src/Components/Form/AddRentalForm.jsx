import { useState } from "react";

const RENTAL_STATUS_OPTIONS = ["Active", "Completed", "Cancelled", "Pending"];

const AddRentalForm = ({ onCancel, onCreate }) => {
  const [form, setForm] = useState({
    PAYMENTID:        "",
    CUSTID:           "",
    CARID:            "",
    RENTALPICKUPDATE: "",
    RENTALRETURNDATE: "",
    RENTALPICKUPTIME: "",
    RENTALRETURNTIME: "",
    RENTALADDRESS:    "",
    RENTALTOTALCOST:  "",
    RENTALSTATUS:     "",
    STAFFID:          ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onCreate(form);
    if (success) onCancel();
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Customer ID
        <input type="number" name="CUSTID" value={form.CUSTID} onChange={handleChange} required />
      </label>

      <label>Car ID
        <input type="number" name="CARID" value={form.CARID} onChange={handleChange} required />
      </label>

      <label>Payment ID
        <input type="number" name="PAYMENTID" value={form.PAYMENTID} onChange={handleChange} />
      </label>

      <label>Pickup Date
        <input type="date" name="RENTALPICKUPDATE" value={form.RENTALPICKUPDATE} onChange={handleChange} />
      </label>

      <label>Return Date
        <input type="date" name="RENTALRETURNDATE" value={form.RENTALRETURNDATE} onChange={handleChange} />
      </label>

      <label>Pickup Time
        <input type="time" name="RENTALPICKUPTIME" value={form.RENTALPICKUPTIME} onChange={handleChange} />
      </label>

      <label>Return Time
        <input type="time" name="RENTALRETURNTIME" value={form.RENTALRETURNTIME} onChange={handleChange} />
      </label>

      <label>Address
        <textarea name="RENTALADDRESS" value={form.RENTALADDRESS} onChange={handleChange} rows={2} />
      </label>

      <label>Total Cost (RM)
        <input type="number" step="0.01" name="RENTALTOTALCOST" value={form.RENTALTOTALCOST} onChange={handleChange} />
      </label>

      <label>Status
        <select name="RENTALSTATUS" value={form.RENTALSTATUS} onChange={handleChange}>
          <option value="">-- Select Status --</option>
          {RENTAL_STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>Staff ID
        <input type="number" name="STAFFID" value={form.STAFFID} onChange={handleChange} />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Rental</button>
      </div>
    </form>
  );
};

export default AddRentalForm;