import { useState, useEffect } from "react";
import "../Components CSS files/EditStaffForm.css";

const EditTeeTimeForm = ({ teeTime, courseList, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    COURSE_ID: "",
    START_TIME: "",
    END_TIME: "",
    AVAILABLE_SLOTS: ""
  });

  useEffect(() => {
    if (teeTime) {
      setFormData({
        COURSE_ID: teeTime.COURSE_ID || "",
        // The backend provides 'YYYY-MM-DDTHH:MI' which works directly with datetime-local
        START_TIME: teeTime.START_TIME || "", 
        END_TIME: teeTime.END_TIME || "",
        AVAILABLE_SLOTS: teeTime.AVAILABLE_SLOTS || ""
      });
    }
  }, [teeTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const formattedValue = (name === "COURSE_ID" || name === "AVAILABLE_SLOTS") 
      ? Number(value) 
      : value;

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // TeeTimeContext will add the TEE_TIME_ID from selectedTeeTime if needed
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Course
        <select name="COURSE_ID" value={formData.COURSE_ID} onChange={handleChange} required>
          <option value="">-- Select Course --</option>
          {courseList.map(c => (
            <option key={c.COURSE_ID} value={c.COURSE_ID}>{c.COURSE_NAME}</option>
          ))}
        </select>
      </label>

      <label>
        Start Time
        <input type="datetime-local" name="START_TIME" value={formData.START_TIME} onChange={handleChange} required />
      </label>

      <label>
        End Time
        <input type="datetime-local" name="END_TIME" value={formData.END_TIME} onChange={handleChange} required />
      </label>

      <label>
        Available Slots
        <input type="number" name="AVAILABLE_SLOTS" value={formData.AVAILABLE_SLOTS} onChange={handleChange} min="1" required />
      </label>

      <div className="modal-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button type="submit" className="save-btn">Update Tee Time</button>
      </div>
    </form>
  );
};

export default EditTeeTimeForm;