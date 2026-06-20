import { useState } from "react";

// Edit these arrays to match your actual fleet — these are the
// dropdown choices shown to the user. Add/remove values freely.
const CAR_TYPES = ["Sedan", "SUV", "MPV", "Hatchback", "Pickup", "Van", "Coupe"];
const CAR_BRANDS = ["Perodua", "Proton", "Toyota", "Honda", "Nissan", "Mazda", "Hyundai", "Kia", "BMW", "Mercedes-Benz"];
const CAR_COLOURS = ["White", "Black", "Silver", "Grey", "Red", "Blue", "Green", "Brown"];
const CAR_SEATS = [2, 4, 5, 6, 7, 8];

// Real CARSTATUS values stored in the DB — keep this in sync with
// whatever exists in the CAR table (checked via: SELECT DISTINCT CARSTATUS FROM CAR;)
const CAR_STATUSES = ["Available", "Rented", "Maintenance"];

const AddCarForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    CARTYPE: CAR_TYPES[0],
    CARBRAND: CAR_BRANDS[0],
    CARMODEL: "",
    CARPLATENO: "",
    CARCOLOUR: CAR_COLOURS[0],
    CARSEAT: CAR_SEATS[2], // defaults to 5
    CARFEE: "",
    CARSTATUS: "Available",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      CARSEAT: Number(formData.CARSEAT),
      CARFEE: Number(formData.CARFEE),
      // NOTE: no .toUpperCase() here — real DB values are mixed case
      // ("Available", not "AVAILABLE"). Forcing uppercase would create
      // a status value that never matches anything.
      CARSTATUS: formData.CARSTATUS,
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Type
        <select name="CARTYPE" value={formData.CARTYPE} onChange={handleChange} required>
          {CAR_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label>
        Brand
        <select name="CARBRAND" value={formData.CARBRAND} onChange={handleChange} required>
          {CAR_BRANDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </label>

      <label>
        Model
        <input type="text" name="CARMODEL" value={formData.CARMODEL} onChange={handleChange} required />
      </label>

      <label>
        Plate No
        <input type="text" name="CARPLATENO" value={formData.CARPLATENO} onChange={handleChange} required />
      </label>

      <label>
        Colour
        <select name="CARCOLOUR" value={formData.CARCOLOUR} onChange={handleChange} required>
          {CAR_COLOURS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label>
        Seats
        <select name="CARSEAT" value={formData.CARSEAT} onChange={handleChange} required>
          {CAR_SEATS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label>
        Fee (RM)
        <input type="number" name="CARFEE" value={formData.CARFEE} onChange={handleChange} min="0" step="0.01" required />
      </label>

      <label>
        Status
        <select name="CARSTATUS" value={formData.CARSTATUS} onChange={handleChange} required>
          {CAR_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Car</button>
      </div>
    </form>
  );
};

export default AddCarForm;