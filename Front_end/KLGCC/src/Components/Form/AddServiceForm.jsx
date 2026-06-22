import { useState, useEffect } from "react";
import API from "../../Api";

const AddServiceForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    CARID: "",
    SERVICEDATE: "",
    SERVICEDESCRIPTION: "",
    SERVICECOST: "",
    STAFFID: "",
    SERVICENEXTDATE: ""
  });

  const [cars, setCars] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    API.get("/api/car/carList", { params: { limit: 1000 } })
      .then(res => setCars(res.data.cars || []))
      .catch(console.error);

    API.get("/api/staff/staffList")
      .then(res => setStaffList(res.data.staffs || []))
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      CARID: Number(formData.CARID),
      SERVICEDATE: formData.SERVICEDATE || null,
      SERVICEDESCRIPTION: formData.SERVICEDESCRIPTION,
      SERVICECOST: Number(formData.SERVICECOST),
      STAFFID: formData.STAFFID ? Number(formData.STAFFID) : null,
      SERVICENEXTDATE: formData.SERVICENEXTDATE || null
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>Car
        <select name="CARID" value={formData.CARID} onChange={handleChange} required>
          <option value="">-- Select Car --</option>
          {cars.map(car => (
            <option key={car.CARID} value={car.CARID}>
              {car.CARID} — {car.CARBRAND} {car.CARMODEL} ({car.CARPLATENO})
            </option>
          ))}
        </select>
      </label>

      <label>Service Date
        <input
          type="date"
          name="SERVICEDATE"
          value={formData.SERVICEDATE}
          onChange={handleChange}
        />
      </label>

      <label>Description
        <textarea
          name="SERVICEDESCRIPTION"
          value={formData.SERVICEDESCRIPTION}
          onChange={handleChange}
          rows={3}
        />
      </label>

      <label>Service Cost (RM)
        <input
          type="number"
          step="0.01"
          name="SERVICECOST"
          value={formData.SERVICECOST}
          onChange={handleChange}
          required
        />
      </label>

      <label>Staff
        <select name="STAFFID" value={formData.STAFFID} onChange={handleChange}>
          <option value="">-- Select Staff (optional) --</option>
          {staffList.map(staff => (
            <option key={staff.STAFFID} value={staff.STAFFID}>
              {staff.STAFFID} — {staff.STAFFNAME}
            </option>
          ))}
        </select>
      </label>

      <label>Next Service Date
        <input
          type="date"
          name="SERVICENEXTDATE"
          value={formData.SERVICENEXTDATE}
          onChange={handleChange}
        />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Add Service</button>
      </div>
    </form>
  );
};

export default AddServiceForm;