import React, { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import "./Course.css";

export default function Course(){
    const [course, setCourse] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDetailsShown, setIsDetailsShown ] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const [selectedProfessor, setSelectedProfessor] = useState(['','',''])
    const navigate = useNavigate();

    const { school, department, name } = useParams();
    
    const fetchCourse = useCallback(async () => {
        try {
            setIsLoading(true);
          const response = await fetch("http://localhost:3456/getCourse", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({school: school, department: department, name: name}),
          });
          const data = await response.json();
          setCourse(data);
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
            setIsLoading(false);
        }
      }, [school, department,name]);

      useEffect(() => {
        fetchCourse();
      }, [fetchCourse, school, department,name]);
      
      const animatedStyle = {animation: "inAnimation 400ms ease-in"};
      const unanimatedStyle = {
        animation: "outAnimation 400ms ease-out",
        animationFillMode: "forwards"
      };

    const openRateMyProfessor = (fullName) => {
      let nameSearch;
      if(typeof fullName !== 'string'){
        nameSearch = selectedProfessor[1].replace(' ','%20')
      } else{
        nameSearch = fullName.replace(' ','%20');
      }

      window.open(`https://www.ratemyprofessors.com/search/professors/1147?q=${nameSearch}`, '_blank', 'noopener,noreferrer');
    }
    
    const writeReview = (schoolNav,deptNav,nameNav) => {
      navigate(`/${schoolNav}/${deptNav}/${nameNav}/review`);
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

    if (isLoading) {
      return(
        <div className ="loadingScreen">
        <ReactLoading type="spokes" color="#D33C41"
      height={100} width={50} />
      </div>
      )  
    }
    return (
        <div className="course-body">
           <div className = "top-bar">
              <div className="btn-container">
              <button className = "back-btn" onClick={() => navigate(-1)}>Back</button>
              </div> 
              <div className="title-container">
              <h2>{course.name}</h2>
              </div>
            </div>
        <div className = "detail">
          <button id = "description-btn"onClick={() => {
            setIsAnimated(!isAnimated)
            if (!isDetailsShown) setIsDetailsShown(true); 
          }}>{isDetailsShown === true ? 'Hide Course Description' : 'Show Course Description'}</button>
          {isDetailsShown && <div className="description" style={isAnimated ? animatedStyle : unanimatedStyle} onAnimationEnd={() => { if (!isAnimated) setIsDetailsShown(false) }}>
            <p id = "course-details">{course.courseDetails}</p>
            </div>}
        </div>
        <div className="review-btn-container">
          <button id = "write-review-btn" onClick={() => writeReview(school, department, name)}>Write a Review</button>
        </div>
        <div className="content-container">
        <div className="content-and-btn">
          Most Recently Offered: {course.lastOffered}
        </div>
        <div className="review-top-bar">
        <div className="content-and-btn">
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
          <h3>Reviews For {selectedProfessor[0] === '' ? 'All Professors' : selectedProfessor[0]}</h3>
          </div>
          </div>
          {course.reviews.map((review) => (
            (selectedProfessor[0] === '' || review.instructor.includes(selectedProfessor[0])) && (
            <div className = "review">
              <div className="difficulty-quality">
              <p id = "quality">Quality: {review.quality}</p>
              <p>Difficulty: {review.difficulty}</p>
              </div>
              <div className="professor-review">
              <p>{review.instructor.length === 1 ? 'Professor' : 'Professors'}: {review.instructor.map((instructor,index) => (
                  <li key = {index} style={{ cursor: 'pointer' }} onClick={() => openRateMyProfessor(instructor)}>{instructor}</li>
              ))}</p>
              <div>
                <p>{review.comment}</p>
              </div>
              <div id = "date">
                <p>{review.date}</p>
              </div>
              </div>
            </div>
            )
          ))}
        </div>




        </div>
    )
}
