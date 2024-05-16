import React, { useState, useEffect } from "react";
import SchoolTab from "../SchoolTab/SchoolTab";
import "./Tabs.css";
import ViewAll from "../ViewAll/ViewAll";
import Departments from "../Departments/Departments";

export default function Tabs({ schools }) {
  const [activeSchool, setActiveSchool] = useState(null);


  useEffect(() => {
    setActiveSchool(sessionStorage.getItem('selectedSchool') == null ? "Arts & Sciences" : sessionStorage.getItem('selectedSchool'));
  }, []);

  return (
    <div>
      <div className="nav">
        {schools.map((school) => (
          <SchoolTab
            key={school} 
            schoolName={school}
            activeSchool={activeSchool}
            setActiveSchool={setActiveSchool}
          />
        ))}
        <div id='viewAll-btn'>
          <ViewAll to="/all"></ViewAll>
        </div>
        
      </div>
      <div className="dept-view">
        {activeSchool && <Departments school={activeSchool} />}
      </div>
    </div>
  );
}
