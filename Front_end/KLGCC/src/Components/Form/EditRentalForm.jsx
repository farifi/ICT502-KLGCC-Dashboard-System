import { useState, useEffect } from "react";
import { useCustomer } from "../../API Contexts Folder/CustomerContext.jsx";
import { useStaff } from "../../API Contexts Folder/StaffContext.jsx";
import API from "../../Api.jsx";

const RENTAL_STATUS_OPTIONS = ["Active", "Completed", "Cancelled", "Pending"];

// Fallback label chains — see AddRentalForm.jsx for the same logic.
const customerLabel = (c) =>
  c.CUSTNAME || c.CUSTOMERNAME || c.NAME || `Customer #${c.CUSTID}`;

const staffLabel = (s) => s.STAFFNAME || s.NAME || `Staff #${s.STAFFID}`;

const carLabel = (c) => `${c.CARPLATENO} — ${c.CARBRAND} ${c.CARMODEL}`;

const EditRentalForm = ({ rental, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
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
    fetchCustomers(1, () => {}, 1000);
    fetchStaffList();

    // ASSUMPTION: dropdown shows Available cars (see AddRentalForm.jsx).
    // The car already assigned to this rental is merged in below even
    // if its status isn't "Available" — otherwise editing a rental
    // whose car is already marked "Rented" would show a blank select.
    API.get("/api/car/carList", { params: { status: "Available", limit: 1000 } })
      .then((res) => {
        const list = res.data.cars || [];
        if (rental?.CARID && !list.some((c) => c.CARID === rental.CARID)) {
          API.get(`/api/car/${rental.CARID}`)
            .then((r) => {
              if (r.data?.car) setAvailableCars([...list, r.data.car]);
              else setAvailableCars(list);
            })
            .catch(() => setAvailableCars(list));
        } else {
          setAvailableCars(list);
        }
      })
      .catch((err) => console.error("Failed to load available cars:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rental]);

  useEffect(() => {
    if (rental) {
      const formatDate = (val) => {
        if (!val) return "";
        const d = new Date(val);
        return isNaN(d) ? "" : d.toISOString().split("T")[0];
      };

      setFormData({
        PAYMENTID:        rental.PAYMENTID        ?? "",
        CUSTID:           rental.CUSTID           ?? "",
        CARID:            rental.CARID            ?? "",
        RENTALPICKUPDATE: formatDate(rental.RENTALPICKUPDATE),
        RENTALRETURNDATE: formatDate(rental.RENTALRETURNDATE),
        RENTALPICKUPTIME: rental.RENTALPICKUPTIME ?? "",
        RENTALRETURNTIME: rental.RENTALRETURNTIME ?? "",
        RENTALADDRESS:    rental.RENTALADDRESS    ?? "",
        RENTALTOTALCOST:  rental.RENTALTOTALCOST  ?? "",
        RENTALSTATUS:     rental.RENTALSTATUS     ?? "",
        STAFFID:          rental.STAFFID          ?? ""
      });
    }
  }, [rental]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSave({
      ...rental,
      ...formData,
      CUSTID: Number(formData.CUSTID),
      CARID: Number(formData.CARID),
      STAFFID: formData.STAFFID ? Number(formData.STAFFID) : null,
      PAYMENTID: formData.PAYMENTID ? Number(formData.PAYMENTID) : null,
      RENTALTOTALCOST: formData.RENTALTOTALCOST ? Number(formData.RENTALTOTALCOST) : null,
    });
    if (success) onCancel();
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Customer
        <select name="CUSTID" value={formData.CUSTID} onChange={handleChange} required>
          <option value="">-- Select Customer --</option>
          {customers.map((c) => (
            <option key={c.CUSTID} value={c.CUSTID}>{customerLabel(c)}</option>
          ))}
        </select>
      </label>

      <label>Car
        <select name="CARID" value={formData.CARID} onChange={handleChange} required>
          <option value="">-- Select Car --</option>
          {availableCars.map((c) => (
            <option key={c.CARID} value={c.CARID}>{carLabel(c)}</option>
          ))}
        </select>
      </label>

      <label>Payment ID
        <input type="number" name="PAYMENTID" value={formData.PAYMENTID} onChange={handleChange} />
      </label>

      <label>Pickup Date
        <input type="date" name="RENTALPICKUPDATE" value={formData.RENTALPICKUPDATE} onChange={handleChange} />
      </label>

      <label>Return Date
        <input type="date" name="RENTALRETURNDATE" value={formData.RENTALRETURNDATE} onChange={handleChange} />
      </label>

      <label>Pickup Time
        <input type="time" name="RENTALPICKUPTIME" value={formData.RENTALPICKUPTIME} onChange={handleChange} />
      </label>

      <label>Return Time
        <input type="time" name="RENTALRETURNTIME" value={formData.RENTALRETURNTIME} onChange={handleChange} />
      </label>

      <label>Address
        <textarea name="RENTALADDRESS" value={formData.RENTALADDRESS} onChange={handleChange} rows={2} />
      </label>

      <label>Total Cost (RM)
        <input type="number" step="0.01" name="RENTALTOTALCOST" value={formData.RENTALTOTALCOST} onChange={handleChange} />
      </label>

      <label>Status
        <select name="RENTALSTATUS" value={formData.RENTALSTATUS} onChange={handleChange}>
          <option value="">-- Select Status --</option>
          {RENTAL_STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>Staff
        <select name="STAFFID" value={formData.STAFFID} onChange={handleChange}>
          <option value="">-- Select Staff --</option>
          {staffList.map((s) => (
            <option key={s.STAFFID} value={s.STAFFID}>{staffLabel(s)}</option>
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

export default EditRentalForm;