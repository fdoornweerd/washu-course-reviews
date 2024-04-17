import React from "react";
import Departments from "../Departments/Departments";



export default function SchoolTab({ schoolName, activeSchool, setActiveSchool}) {



const chooseSchool = () => {
  setActiveSchool(schoolName)
}

  return (
    //check if school is active dept
    <div className = "main-body">
    <div className = "tabs">
    <button className = "school-btn"
    onClick={chooseSchool}
    >{schoolName}</button>
    </div>
    <div className = "dept-view">
      {schoolName === activeSchool &&   <Departments key={schoolName} school = {schoolName}/>}
    </div>
    </div>
  )
}
