import { useState, useEffect } from "react";
import "../Components CSS files/AddStaffForm.css";

const EditCourseForm = ({ course, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    COURSE_NAME: "",
    DESCRIPTION: "",
    HOLES: "",
    DIFFICULTY_LEVEL: ""
  });

  useEffect(() => {
    if (course) {
      setFormData({
        COURSE_NAME: course.COURSE_NAME || "",
        DESCRIPTION: course.DESCRIPTION || "",
        HOLES: course.HOLES || "",
        DIFFICULTY_LEVEL: course.DIFFICULTY_LEVEL || ""
      });
    }
  }, [course]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <form className="edit-staff-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...course, ...formData }); }}>
      <label>Name<input name="COURSE_NAME" value={formData.COURSE_NAME} onChange={handleChange} required /></label>
      <label>Description<input name="DESCRIPTION" value={formData.DESCRIPTION} onChange={handleChange} /></label>
      <label>Holes<input type="number" name="HOLES" value={formData.HOLES} onChange={handleChange} required /></label>
      <label>Difficulty<input name="DIFFICULTY_LEVEL" value={formData.DIFFICULTY_LEVEL} onChange={handleChange} /></label>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
};

export default EditCourseForm;