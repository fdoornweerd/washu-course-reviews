import React, {useState} from "react";
import SchoolTab from "../SchoolTab/SchoolTab";

export default function Tabs({schools}) {
  const [activeSchool, setActiveSchool] = useState("");

  return (
    schools.map((school) => (
        <SchoolTab schoolName={school} activeSchool={activeSchool} setActiveSchool={setActiveSchool} />
      ))
  );

}