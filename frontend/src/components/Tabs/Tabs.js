import React from "react";
import SchoolTab from "../SchoolTab/SchoolTab";

export default function Tabs({departments}) {
    const SCHOOLS_ALLOWED = ['Architecture','Art','Arts & Sciences','Business','Engineering','Interdisciplinary Programs'];
    

    

      {SCHOOLS_ALLOWED.map((school) => {
        if (departments != null) {
          return (
            <SchoolTab school={school} departments={departments[school]} />
          );
        } else{
            console.log(school);
            return (
                <SchoolTab school={school} departments={[]} />
              ); 
        }

      })}

}