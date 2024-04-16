import React from "react";

export default function Departments({ departments }) {
  return (
    <div>
      <h3>"Departments:"</h3>
      <ul>
        {departments.map((dept) => (
          <li>{dept}</li>
        ))}
      </ul>
    </div>
  );
}
