import { useState } from "react";
import "../Components CSS files/AddStaffForm.css";

const AddCourseForm = ({ onCancel, onCreate }) => {
  const [formData, setFormData] = useState({
    COURSE_NAME: "",
    DESCRIPTION: "",
    HOLES: "",
    DIFFICULTY_LEVEL: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure HOLES is sent as a number for the database
    const dataToSubmit = {
      ...formData,
      HOLES: parseInt(formData.HOLES, 10)
    };
    onCreate(dataToSubmit);
  };

  return (
    <form className="edit-staff-form" onSubmit={handleSubmit}>
      <label>
        Course Name
        <input
          name="COURSE_NAME"
          value={formData.COURSE_NAME}
          onChange={handleChange}
          placeholder="e.g., Emerald Greens"
          required
        />
      </label>

      <label>
        Description
        <input
          name="DESCRIPTION"
          value={formData.DESCRIPTION}
          onChange={handleChange}
          placeholder="Brief description of the course"
        />
      </label>

      <label>
        Holes
        <input
          type="number"
          name="HOLES"
          value={formData.HOLES}
          onChange={handleChange}
          placeholder="e.g., 18"
          required
        />
      </label>

      <label>
        Difficulty Level
        <select 
          name="DIFFICULTY_LEVEL" 
          value={formData.DIFFICULTY_LEVEL} 
          onChange={handleChange}
          required
        >
          <option value="">-- Select Difficulty --</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Difficult">Difficult</option>
          <option value="Pro">Pro</option>
        </select>
      </label>

      <div className="modal-actions">
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="submit-btn">
          Add Course
        </button>
      </div>
    </form>
  );
};

export default AddCourseForm;