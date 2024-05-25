import React, { useState, useEffect,useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactLoading from "react-loading";
import "./Course.css";
import ViewReview from "../ViewReview/ViewReview";

export default function Course(){
    const [course, setCourse] = useState([])
    const [isDisabled, setIsDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true)
    const [isDetailsShown, setIsDetailsShown ] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);
    const [profScores, setProfScores] = useState([0,0]);
    const [selectedProfessor, setSelectedProfessor] = useState(['','',''])



    const navigate = useNavigate();


    // adjust structure for phone
    const [isSmallWindow, setIsSmallWindow] = useState(false);
    const handleResize = () => {
      if (window.innerWidth < 830) {
          setIsSmallWindow(true);
        } else{
          setIsSmallWindow(false);
        }
    };
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => {
          window.removeEventListener('resize', handleResize);
      };
  }, []);

    let { department, name } = useParams();
    name = decodeURIComponent(name);

    const colors = ["#D3D3D3","#DD3730","#FF9500","#FFCD00","#9ED10F","#3BA500"];
    const difficultColors= ["#3BA500","#9ED10F","#FFCD00","#FF9500","#DD3730"]; //green, green yellow, yellow, light red, dark red
    const fetchCourse = useCallback(async () => {
        try {
            setIsLoading(true);
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/getCourse`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({name: name}),
          });
          const data = await response.json();
          setCourse(data);
          handleResize();
          const value = localStorage.getItem(data._id);
          if (value) {
              setIsDisabled(true);
          }
        } catch (error) {
          console.error("Error fetching course:", error);
        } finally {
            setIsLoading(false);
        }
      }, [name]);
      
      useEffect(() => {
        fetchCourse();
      }, [fetchCourse, name]);

      
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
    
    const writeReview = (deptNav,nameNav) => {
      navigate(`/${deptNav}/${nameNav}/review`);
    }

    const selectNewProfessor = (event) => {
      const idx = event.target.value;
      let lastName;
      let fullName;
      let semestersTaught;
      if(idx !== 'All Professors'){
        const sortedInstructors = course.instructors.sort((a, b) => a.lastName.localeCompare(b.lastName));
        lastName = sortedInstructors[idx].lastName;
        fullName = sortedInstructors[idx].fullName;
        semestersTaught = sortedInstructors[idx].semestersTaught;
      } else{
        lastName = '';
        fullName = '';
        semestersTaught = '';
      }
      setSelectedProfessor([lastName,fullName,semestersTaught]);
      updateAvgScores(lastName);
    }



    const updateAvgScores = useCallback((lastName) => {
        if(course.reviews == null){
          return;
        }
        let quality = 0;
        let difficulty = 0;
        let numScores = 0
        for(const review of course.reviews){
          if(lastName === '' || review.instructor.includes(lastName)){
            quality+=parseInt(review.quality);
            difficulty+=parseInt(review.difficulty);
            numScores+=1;
          }
        }
        const avgQuality = numScores > 0 ? (quality / numScores).toFixed(1) : 'N/A';
        const avgDifficulty = numScores > 0 ? (difficulty / numScores).toFixed(1) : 'N/A';

        setProfScores([avgQuality,avgDifficulty]);
      },[course.reviews])

      useEffect(() => {
        if (course && course.reviews) {
            updateAvgScores('');
        }
      }, [course, updateAvgScores]); 


    const displayAttributes = () => {
      let display = '';
      for(const attrSchool of course.attributes){
        display+=(`${attrSchool.attributeSchool}: `+ attrSchool.attributeList.join(', ')+'\u00A0\u00A0\u00A0\u00A0')
      }

      return display;
      
    }

    const handleBack = () => {
      if(sessionStorage.getItem('prevPath') == null){
        navigate(`/${department}`);
      } else{
        navigate(sessionStorage.getItem('prevPath'));
      }

    }

    if (isLoading) {
      return(
        <>
        <div className = "top-bar">
        <div className="btn-container">
        <button className = "back-btn" onClick={handleBack}>Back</button>
        </div> 
        <div className="title-container">
        <h2>{course.name}</h2>
        </div>
      </div>
        <div className ="loadingScreen">
          <ReactLoading type="bars" color="#606E52"
        height={160} width={80} />
        </div>
        </>
      )  
    }



      

    return (
      <div className="course-body">
           <div className = "top-bar">
              <div className="btn-container">
              <button className = "back-btn" onClick={handleBack}>Back</button>
              </div> 
              <div className="title-container">
              <h2>{course.name}</h2>
              <h5>{course.code.map((code, index) => code).join(', ')}</h5>
              </div>


            </div>

        <div className="review-top-bar">
        <div className="detail">
        <div className="section-wrapper">


          {isSmallWindow && 
          <div className="avgResult-container">
          <div className="rating-section">
              <p className="avgQuality-label">Quality:</p>
              <div className="avg-rating-box" style={{ backgroundColor: profScores[0] > 0 ? colors[Math.round(profScores[0])] : '#D3D3D3' }}>
                  <p className="avg-rating-box-num">{profScores[0] > 0 ? profScores[0] : 'N/A'}</p>
              </div>
          </div>
          <div className="rating-section">
              <p className="avgDifficulty-label">Difficulty:</p>
              <div className="avg-rating-box" style={{ backgroundColor: profScores[1] > 0 ? difficultColors[Math.round(profScores[1] - 1)] : '#D3D3D3' }}>
                  <p className="avg-rating-box-num">{profScores[1] > 0 ? profScores[1] : 'N/A'}</p>
              </div>
          </div>
      </div>
      }

          {!isSmallWindow && 
               <button id="description-btn" onClick={() => {
                setIsAnimated(!isAnimated);
                if (!isDetailsShown) setIsDetailsShown(true);
            }}>
                {isDetailsShown ? 'Hide Course Description' : 'Show Course Description'}
            </button>
          }
       
            {isSmallWindow && 
              <button id="description-btn" onClick={() => {
                  setIsAnimated(!isAnimated);
                  if (!isDetailsShown) setIsDetailsShown(true);
              }}>
                  {isDetailsShown ? 'Hide Course Description' : 'Show Course Description'}
              </button>
            }
            {isDetailsShown && isSmallWindow && (
                <div className="description" style={isAnimated ? animatedStyle : unanimatedStyle} onAnimationEnd={() => {
                    if (!isAnimated) setIsDetailsShown(false);
                }}>
                    <p id="course-details">{course.courseDetails}</p>
                    <div className="small">
                        This course was most recently offered: {course.lastOffered}
                    </div>
                    <div className="small">
                        Attributes: {displayAttributes()}
                    </div>
                </div>
            )}

            {!isSmallWindow && 
            <div className="avgResult-container">
            <div className="rating-section">
                <p className="avgQuality-label">Quality:</p>
                <div className="avg-rating-box" style={{ backgroundColor: profScores[0] > 0 ? colors[Math.round(profScores[0])] : '#D3D3D3' }}>
                    <p className="avg-rating-box-num">{profScores[0] > 0 ? profScores[0] : 'N/A'}</p>
                </div>
            </div>
            <div className="rating-section">
                <p className="avgDifficulty-label">Difficulty:</p>
                <div className="avg-rating-box" style={{ backgroundColor: profScores[1] > 0 ? difficultColors[Math.round(profScores[1] - 1)] : '#D3D3D3' }}>
                    <p className="avg-rating-box-num">{profScores[1] > 0 ? profScores[1] : 'N/A'}</p>
                </div>
            </div>
        </div>
            }
            


            <div className="right-btn">
              <button id="write-review-btn" onClick={() => writeReview(department, name)} disabled={isDisabled}>Write a Review</button>
            </div>

            </div>

            {isDetailsShown && !isSmallWindow && (
                <div className="description" style={isAnimated ? animatedStyle : unanimatedStyle} onAnimationEnd={() => {
                    if (!isAnimated) setIsDetailsShown(false);
                }}>
                    <p id="course-details">{course.courseDetails}</p>
                    <div className="small">
                        This course was most recently offered: {course.lastOffered}
                    </div>
                    <div className="small">
                        Attributes: {displayAttributes()}
                    </div>
                </div>
            )}
        </div>


          
    </div>



  <div className="content-container">
    <div className="review-top-bar">


      <div className="content-and-btn">
        <label htmlFor="professor-select">Select Professor:</label>
        <select class='select-input' id="professor-select" onChange={selectNewProfessor}>
          <option key={-1} value="All Professors">All Professors</option>
          {[...course.instructors].sort((a, b) => a.lastName.localeCompare(b.lastName)).map((instructor, index) => (
            <option key={index} value={index}>{instructor.lastName}</option>
          ))}
        </select>
        {!isSmallWindow && selectedProfessor[2] !== '' && 
          <p className="small">Semesters Taught In The Past: {selectedProfessor[2].map((semester, index) => semester).join(', ')}</p>
        }
        {isSmallWindow && selectedProfessor[2] !== '' && 
          <div class="semesters-taught-container"> 
            <p>Semesters Taught In The Past:</p>
            <p>{selectedProfessor[2].map((semester, index) => semester).join(', ')}</p>
          </div>
        }
        
      </div>

      {selectedProfessor[0] !== '' && 
          <button id="RMP-btn" onClick={openRateMyProfessor}>Search RateMyProfessor</button>
      }

    </div>
  </div>



        <div>
          {course.reviews.sort((a,b) => b.comment.length - a.comment.length).sort((a, b) => b.upVotes - a.upVotes).map((review,index) => (
            <ViewReview key={index} courseName={course.name} review={review} colors={colors} difficultColors={difficultColors} professor={selectedProfessor[0]} isSmallWidth={isSmallWindow} />
          ))}
        </div>




        </div>
    )
}
