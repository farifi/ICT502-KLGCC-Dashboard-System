import { useState, useEffect } from "react";

const EditCarForm = ({ car, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    CARTYPE: "",
    CARBRAND: "",
    CARMODEL: "",
    CARPLATENO: "",
    CARCOLOUR: "",
    CARSEAT: "",
    CARFEE: "",
    CARSTATUS: "AVAILABLE"
  });

  useEffect(() => {
    if (car) {
      setFormData({
        CARTYPE: car.CARTYPE || "",
        CARBRAND: car.CARBRAND || "",
        CARMODEL: car.CARMODEL || "",
        CARPLATENO: car.CARPLATENO || "",
        CARCOLOUR: car.CARCOLOUR || "",
        CARSEAT: car.CARSEAT || "",
        CARFEE: car.CARFEE || "",
        CARSTATUS: car.CARSTATUS || "AVAILABLE"
      });
    }
  }, [car]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...car,
      ...formData,
      CARSEAT: Number(formData.CARSEAT),
      CARFEE: Number(formData.CARFEE),
      CARSTATUS: formData.CARSTATUS.toUpperCase()
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Type
        <input type="text" name="CARTYPE" value={formData.CARTYPE} onChange={handleChange} required />
      </label>
      <label>Brand
        <input type="text" name="CARBRAND" value={formData.CARBRAND} onChange={handleChange} required />
      </label>
      <label>Model
        <input type="text" name="CARMODEL" value={formData.CARMODEL} onChange={handleChange} required />
      </label>
      <label>Plate No
        <input type="text" name="CARPLATENO" value={formData.CARPLATENO} onChange={handleChange} required />
      </label>
      <label>Colour
        <input type="text" name="CARCOLOUR" value={formData.CARCOLOUR} onChange={handleChange} required />
      </label>
      <label>Seats
        <input type="number" name="CARSEAT" value={formData.CARSEAT} onChange={handleChange} min="1" required />
      </label>
      <label>Fee (RM)
        <input type="number" name="CARFEE" value={formData.CARFEE} onChange={handleChange} min="0" step="0.01" required />
      </label>
      <label>Status
        <select name="CARSTATUS" value={formData.CARSTATUS} onChange={handleChange}>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="UNAVAILABLE">UNAVAILABLE</option>
        </select>
      </label>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Car</button>
      </div>
    </form>
  );
};

export default EditCarForm;