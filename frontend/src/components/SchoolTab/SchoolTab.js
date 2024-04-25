import React from "react";
import "./SchoolTab.css";

export default function SchoolTab({ schoolName, activeSchool, setActiveSchool }) {
  const chooseSchool = () => {
    sessionStorage.setItem('selectedSchool',schoolName);
    setActiveSchool(schoolName);
  };

  const isActive = schoolName === activeSchool;

  return (
    <div className="main-body">
      <button
        className={`school-btn ${isActive ? "active" : ""}`}
        onClick={chooseSchool}
      >
        {schoolName}
      </button>
    </div>
  );
}
