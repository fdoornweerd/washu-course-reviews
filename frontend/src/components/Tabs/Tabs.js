import React, {useState} from "react";
import SchoolTab from "../SchoolTab/SchoolTab";
import "./Tabs.css";
import ViewAll from "../ViewAll/ViewAll";
import Departments from "../Departments/Departments";

export default function Tabs({schools}) {
  const [activeSchool, setActiveSchool] = useState("");

  return (
    <div>
    <div className="nav">
    {schools.map((school) => (
        <SchoolTab schoolName={school} activeSchool={activeSchool} setActiveSchool={setActiveSchool} />
      ))}
       <ViewAll to="/all"></ViewAll>
      </div>
       <div className = "dept-view">
       {activeSchool &&   <Departments  school = {activeSchool}/>}
     </div>
     </div>
  );

}