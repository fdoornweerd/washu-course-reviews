import React from "react";
import SchoolTab from "../SchoolTab/SchoolTab";

export default function Tabs({schools, setActiveDept}) {


    return (
        schools.map((school) => (
            <SchoolTab school={school} />
          ))


    );
}