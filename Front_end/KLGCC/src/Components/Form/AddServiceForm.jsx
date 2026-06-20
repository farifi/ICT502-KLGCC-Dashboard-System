import { useState } from "react";

const AddServiceForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    CARID: "",
    SERVICEDATE: "",
    SERVICEDESCRIPTION: "",
    SERVICECOST: "",
    STAFFID: "",
    SERVICENEXTDATE: ""
  });

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
      <label>Car ID
        <input
          type="number"
          name="CARID"
          value={formData.CARID}
          onChange={handleChange}
          required
        />
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

      <label>Staff ID
        <input
          type="number"
          name="STAFFID"
          value={formData.STAFFID}
          onChange={handleChange}
        />
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