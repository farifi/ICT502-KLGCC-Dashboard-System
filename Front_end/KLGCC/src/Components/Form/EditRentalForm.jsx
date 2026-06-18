import { useState, useEffect } from "react";

const RENTAL_STATUS_OPTIONS = ["Active", "Completed", "Cancelled", "Pending"];

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

  useEffect(() => {
    if (rental) {
      // Format Oracle date strings to yyyy-MM-dd for <input type="date">
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
    const success = await onSave({ ...rental, ...formData });
    if (success) onCancel();
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Customer ID
        <input type="number" name="CUSTID" value={formData.CUSTID} onChange={handleChange} required />
      </label>

      <label>Car ID
        <input type="number" name="CARID" value={formData.CARID} onChange={handleChange} required />
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

      <label>Staff ID
        <input type="number" name="STAFFID" value={formData.STAFFID} onChange={handleChange} />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
};

export default EditRentalForm;