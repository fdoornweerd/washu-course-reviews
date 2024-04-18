import React, { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";

export default function Course(){
    const [course, setCourse] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [ isDetailsShown, setIsDetailsShown ] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState(['','',''])
    const navigate = useNavigate();

    const { school, department, code } = useParams();
    
    const fetchCourse = useCallback(async () => {
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
      }, [school, department,code]);

      useEffect(() => {
        fetchCourse();
      }, [fetchCourse, school, department,code]);
  


    const toggleDescription = () => {
      setIsDetailsShown(!isDetailsShown);
    }

    const openRateMyProfessor = (fullName) => {
      let nameSearch;
      if(typeof fullName !== 'string'){
        nameSearch = selectedProfessor[1].replace(' ','%20')
      } else{
        nameSearch = fullName.replace(' ','%20');
      }

      window.open(`https://www.ratemyprofessors.com/search/professors/1147?q=${nameSearch}`, '_blank', 'noopener,noreferrer');
    }
    
    const writeReview = (schoolNav,deptNav,codeNav) => {
      navigate(`/${schoolNav}/${deptNav}/${codeNav}/review`);
    }

    const selectNewProfessor = (event) => {
      const idx = event.target.value;
      let lastName;
      let fullName;
      let semestersTaught;
      if(idx !== 'All Professors'){
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
      return <ReactLoading type="spokes" color="#0000FF"
      height={100} width={50} />;
    }
    return (
        <>
        <h2>{course.name} - {course.code}</h2>
        <div>
          Most Recently Offered: {course.lastOffered}
        </div>
        <div>
          <button onClick={() => writeReview(school, department, code)}>Write a Review</button>
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
              <option key = {index} value = {index}>
                {instructor.lastName}
              </option>
            ))}

          </select>
        </div>
        <div>
          {selectedProfessor[0] !== '' && <button onClick={openRateMyProfessor}>Search RateMyProfessor For {selectedProfessor[1]}</button>}
        </div>
        <div>
          {selectedProfessor[2] !== '' && 
            <>
            <p>Semesters Taught In The Past:</p>
            {selectedProfessor[2].map((semester, index) => (
                <li key = {index} >{semester}</li>
              ))}
            </>
          }
        </div>
        <div>
          <p>Reviews For {selectedProfessor[0] === '' ? 'All Professors' : selectedProfessor[0]}</p>
          {course.reviews.map((review) => (
            (selectedProfessor[0] === '' || review.instructor.includes(selectedProfessor[1])) && (
            <div className = "review">
              <p>Quality: {review.quality}</p>
              <p>Difficulty: {review.difficulty}</p>

              <p>{review.instructor.length === 1 ? 'Professor' : 'Professors'}: {review.instructor.map((instructor,index) => (
                  <li key = {index} style={{ cursor: 'pointer' }} onClick={() => openRateMyProfessor(instructor)}>{instructor}</li>
              ))}</p>
              <div>
                <p>{review.comment}</p>
              </div>
              <div>
                {review.date}
              </div>
            </div>
            )
          ))}

        </div>




        </>
    )
}
