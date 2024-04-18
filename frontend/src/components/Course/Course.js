import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Course(){
    const [course, setCourse] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [ isDetailsShown, setIsDetailsShown ] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState(['','',''])


    const { school, department, code } = useParams();
    

    useEffect(() => {
      fetchCourse();
    }, [school, department, code]);

    async function fetchCourse(){
        try {
            setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({school: school, department: department, code: code}),
          });
          const data = await response.json();
          setCourse(data);
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
            setIsLoading(false);
        }
      };


    const toggleDescription = () => {
      setIsDetailsShown(!isDetailsShown);
    }

    const openRateMyProfessor = () => {
      const nameParts = selectedProfessor[1].split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[1];
      window.open(`https://www.ratemyprofessors.com/search/professors/1147?q=${firstName}%20${lastName}`, '_blank', 'noopener,noreferrer');
    }
    
    const selectNewProfessor = (event) => {
      const idx = event.target.value;
      let lastName;
      let fullName;
      let semestersTaught;
      if(idx != 'All Professors'){
        lastName = course.instructors[idx].lastName;
        fullName = course.instructors[idx].fullName;
        semestersTaught = course.instructors[idx].semestersTaught;
  
      } else{
        lastName = '';
        fullName = '';
        semestersTaught = '';
      }
      setSelectedProfessor([lastName,fullName,semestersTaught]);

    }

    if(isLoading){
      return <div>Loading...</div>
    }
    return (
        <>
        <h2>{course.name} - {course.code}</h2>


        <div>
          Most Recently Offered: {course.lastOffered}
        </div>


        <div>
          {!isDetailsShown && <button onClick={()=> toggleDescription()}>Open Description</button>}
          {isDetailsShown && <button onClick={()=> toggleDescription()}>Close Description</button>}
          {isDetailsShown && <p>{course.courseDetails}</p>}
        </div>




        <div>
          <p>Select Professor:</p>
          <select onChange={selectNewProfessor}>
            <option key={-1} value="All Professors">All Professors</option>

            {course.instructors.map((instructor, index) => (
              <option key={index} value={index}>
                {instructor.lastName}
              </option>
            ))}

          </select>
        </div>



        <div>
          {selectedProfessor[0] != '' && <button onClick={openRateMyProfessor}>Search RateMyProfessor For {selectedProfessor[1]}</button>}
        </div>


        <div>
          {selectedProfessor[2] != '' && 
            <>
            <p>Semesters Taught In The Past:</p>
            {selectedProfessor[2].map((semester) => (
                <li>{semester}</li>
              ))}
            </>
          }
        </div>
       
        </>
    )
}
