import React, { useState } from "react";
import Departments from "../Departments/Departments";

export default function SchoolTab({ school, departments }) {
  const [showDepartments, setShowDepartments] = useState(true);

  const toggleDepartments = () => {
    setShowDepartments(!showDepartments);
  };

  return (
    <div>
      <p>SCHOOL: {school}</p>
      <button onClick={toggleDepartments}>
        {showDepartments ? `Hide ${school} Departments` : `View ${school} Departments`}
      </button>
      {showDepartments && <Departments departments={departments} />}
    </div>
  );
}
