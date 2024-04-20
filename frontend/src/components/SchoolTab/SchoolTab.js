import React from "react";
import Departments from "../Departments/Departments";
import "./SchoolTab.css";


export default function SchoolTab({ schoolName, activeSchool, setActiveSchool}) {



const chooseSchool = () => {
  setActiveSchool(schoolName)
}

  return (
    //check if school is active dept
    <div className = "main-body">
    <button className = "school-btn"onClick={chooseSchool}>{schoolName}</button>
    </div>
  )
}
