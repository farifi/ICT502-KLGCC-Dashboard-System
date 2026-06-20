import { useState, useEffect } from "react";
import { useCustomer } from "../../API Contexts Folder/CustomerContext.jsx";
import { useStaff } from "../../API Contexts Folder/StaffContext.jsx";
import API from "../../Api.jsx";

const RENTAL_STATUS_OPTIONS = ["Active", "Completed", "Cancelled", "Pending"];

// Fallback label chains: if the expected name field doesn't exist on a
// record, fall back to something readable instead of showing "undefined".
// Adjust the field names here if they don't match your actual schema.
const customerLabel = (c) =>
  c.CUSTNAME || c.CUSTOMERNAME || c.NAME || `Customer #${c.CUSTID}`;

const staffLabel = (s) => s.STAFFNAME || s.NAME || `Staff #${s.STAFFID}`;

const carLabel = (c) => `${c.CARPLATENO} — ${c.CARBRAND} ${c.CARMODEL}`;

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

  const { customers, fetchCustomers } = useCustomer();
  const { staffList, fetchStaffList } = useStaff();
  const [availableCars, setAvailableCars] = useState([]);

  useEffect(() => {
    // Large limit so the dropdown effectively shows "all customers"
    // rather than just one paginated page of 5.
    fetchCustomers(1, () => {}, 1000);
    fetchStaffList();

    // ASSUMPTION: only cars with status "Available" can be assigned to
    // a new rental. Remove the status param below if you want every car
    // to show up regardless of status.
    API.get("/api/car/carList", { params: { status: "Available", limit: 1000 } })
      .then((res) => setAvailableCars(res.data.cars || []))
      .catch((err) => console.error("Failed to load available cars:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onCreate({
      ...form,
      CUSTID: Number(form.CUSTID),
      CARID: Number(form.CARID),
      STAFFID: form.STAFFID ? Number(form.STAFFID) : null,
      PAYMENTID: form.PAYMENTID ? Number(form.PAYMENTID) : null,
      RENTALTOTALCOST: form.RENTALTOTALCOST ? Number(form.RENTALTOTALCOST) : null,
    });
    if (success) onCancel();
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Customer
        <select name="CUSTID" value={form.CUSTID} onChange={handleChange} required>
          <option value="">-- Select Customer --</option>
          {customers.map((c) => (
            <option key={c.CUSTID} value={c.CUSTID}>{customerLabel(c)}</option>
          ))}
        </select>
      </label>

      <label>Car
        <select name="CARID" value={form.CARID} onChange={handleChange} required>
          <option value="">-- Select Car --</option>
          {availableCars.map((c) => (
            <option key={c.CARID} value={c.CARID}>{carLabel(c)}</option>
          ))}
        </select>
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

      <label>Staff
        <select name="STAFFID" value={form.STAFFID} onChange={handleChange}>
          <option value="">-- Select Staff --</option>
          {staffList.map((s) => (
            <option key={s.STAFFID} value={s.STAFFID}>{staffLabel(s)}</option>
          ))}
        </select>
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Rental</button>
      </div>
    </form>
  );
};

export default AddRentalForm;