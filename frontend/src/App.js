import './App.css';
import axios from 'axios'; // what does this do?
import React, { useState, useEffect } from "react";



const fetchSchools = () => {
  axios.get('http://localhost:3456').then((data) => {
    //this console.log will be in our frontend console
    return data
  })
}

function App() {
//   const [schools, setSchools] = useState([]);

//  useEffect(() => {
//     fetch("http://localhost:3456")
//       .then((res) => res.json())
//       .then((data) => setSchools(data));
//   }, []);

  const schools = fetchSchools();
console.log(schools);
  return (
    <div className="App">
        {schools.map((school) => (
          <p>
            {school}
          </p>
        ))}
    </div>
  );
}

export default App;
