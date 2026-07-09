import { useState, useEffect } from "react";
import API from "../../Api";

const EditServiceForm = ({ service, onCancel, onSave }) => {
  const [cars, setCars] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [formData, setFormData] = useState({
    CARID: "",
    SERVICEDATE: "",
    SERVICEDESCRIPTION: "",
    SERVICECOST: "",
    STAFFID: "",
    SERVICENEXTDATE: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const carRes = await API.get("/api/car/carList", {
          params: { limit: 1000 },
        });

        setCars(carRes.data.cars || []);

        const staffRes = await API.get("/api/staff/staffList");
        setStaffList(staffRes.data.staffs || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (service) {
      const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
      };

      setFormData({
        CARID: service.CARID || "",
        SERVICEDATE: formatDate(service.SERVICEDATE),
        SERVICEDESCRIPTION: service.SERVICEDESCRIPTION || "",
        SERVICECOST: service.SERVICECOST || "",
        STAFFID: service.STAFFID || "",
        SERVICENEXTDATE: formatDate(service.SERVICENEXTDATE),
      });
    }
  }, [service]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      ...service,
      CARID: Number(formData.CARID),
      SERVICEDATE: formData.SERVICEDATE || null,
      SERVICEDESCRIPTION: formData.SERVICEDESCRIPTION,
      SERVICECOST: Number(formData.SERVICECOST),
      STAFFID: formData.STAFFID ? Number(formData.STAFFID) : null,
      SERVICENEXTDATE: formData.SERVICENEXTDATE || null,
    });
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Car
        <select
          name="CARID"
          value={formData.CARID}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Car --</option>

          {cars.map((car) => (
            <option key={car.CARID} value={car.CARID}>
              {car.CARBRAND} {car.CARMODEL} ({car.CARPLATENO})
            </option>
          ))}
        </select>
      </label>

      <label>
        Service Date
        <input
          type="date"
          name="SERVICEDATE"
          value={formData.SERVICEDATE}
          onChange={handleChange}
        />
      </label>

      <label>
        Description
        <textarea
          name="SERVICEDESCRIPTION"
          value={formData.SERVICEDESCRIPTION}
          onChange={handleChange}
          rows="3"
        />
      </label>

      <label>
        Service Cost (RM)
        <input
          type="number"
          step="0.01"
          name="SERVICECOST"
          value={formData.SERVICECOST}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Staff
        <select
          name="STAFFID"
          value={formData.STAFFID}
          onChange={handleChange}
        >
          <option value="">-- Select Staff --</option>

          {staffList.map((staff) => (
            <option key={staff.STAFFID} value={staff.STAFFID}>
              {staff.STAFFNAME}
            </option>
          ))}
        </select>
      </label>

      <label>
        Next Service Date
        <input
          type="date"
          name="SERVICENEXTDATE"
          value={formData.SERVICENEXTDATE}
          onChange={handleChange}
        />
      </label>

      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>

        <button type="submit">
          Save
        </button>
      </div>
    </form>
  );
};

export default EditServiceForm;