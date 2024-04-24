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
    const colors = ["#D3D3D3","#ff7f7f","#ff7f7f","#FFF03A","#90EE90","#D3D3D3"];//grey, red, yellow, green
    const difficultColors= ["#00FF00","#DFFF00","#ffc107","#ff7f7f","#FF5733"];
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
            <div className = "small">
          This course was most recently offered: {course.lastOffered}
        </div>
            </div>}
        </div>
        <div className="content-container">
        <div id = "before-reviews">
        <div className="review-top-bar">
        <div>
          <h3>Reviews For {selectedProfessor[0] === '' ? 'All Professors' : selectedProfessor[0]}</h3>
          </div>
          <div className="content-and-btn">
          <label htmlFor="professor-select">Select Professor:</label>
          <select id = "professor-select" onChange={selectNewProfessor}>
            <option key={-1} value="All Professors">All Professors</option>
            {course.instructors.map((instructor, index) => (
              <option key = {index} value = {index}>
                {instructor.lastName}
              </option>
            ))}
          </select>
        </div>
        </div>
          <div>
          {selectedProfessor[0] !== '' && <button onClick={openRateMyProfessor}>Search RateMyProfessor For {selectedProfessor[1]}</button>}
        </div>
        <div>
          {selectedProfessor[2] !== '' && 
            <>
            <p className = "small">Semesters Taught In The Past:</p>
            {selectedProfessor[2].map((semester, index) => (
                <li className = "small" key = {index} >{semester}</li>
              ))}
            </>
          }
        </div>
        </div>
        <div className="review-btn-container">
          <button id = "write-review-btn" onClick={() => writeReview(school, department, name)}><span>Write a Review</span></button>
        </div>
          {course.reviews.map((review) => (
            (selectedProfessor[0] === '' || review.instructor.includes(selectedProfessor[0])) && (
            <div className = "review">
               <div className = "rating-container">
                  <p className = "rating-label">Quality:</p>
                  <div className = "rating-box" style={{backgroundColor: colors[Math.floor(review.quality)]}}>
                    <p className = "rating-box-num">{review.quality >0 ? review.quality : 'N/A'}</p>
                  </div>
                </div>
                <div className = "rating-container">
                  <p className = "rating-label">Difficulty:</p>
                  <div className = "rating-box" style={{backgroundColor: difficultColors[Math.round(review.difficulty -1)]}}>
                    <p className = "rating-box-num">{review.difficulty >0 ? review.difficulty: 'N/A'}</p>
                  </div>
                </div>
                <div className = "review-stack">
               <div className="professor-and-date">
              <div className = "professor-container">
              <p>{review.instructor.length === 1 ? 'Professor' : 'Professors'}: {review.instructor.map((instructor,index) => (
                  <li key = {index} style={{ cursor: 'pointer' }} onClick={() => openRateMyProfessor(instructor)}>{instructor}</li>
              ))}</p>
              </div>
              <div id = "date">
                <p>{review.date}</p>
              </div>
              </div>
              <div id = "review-content">
                <p>{review.comment}</p>
              </div>
              </div>
            </div>
            )
          ))}
        </div>




        </div>
    )
}
