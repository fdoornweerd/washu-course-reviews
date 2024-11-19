import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate,useLocation } from 'react-router-dom';
import ReactLoading from "react-loading";
import Dropdown from 'react-multilevel-dropdown';
import './CoursesSelector.css';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export default function CoursesSelector(){
  const [courses, setCourses] = useState([]);
  const [attributions, setAttributions] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [inputValue, setInputValue] = useState(sessionStorage.getItem('searchTerm') !== null ? sessionStorage.getItem('searchTerm') : '');
  const [filterType, setFilterType] = useState(sessionStorage.getItem('filterType') !== null ? sessionStorage.getItem('filterType') : 'Popularity');
  const [isLoading, setIsLoading] = useState(true);
  const [numPages, setNumPages] = useState(1);


  const [selectedSchool, setSelectedSchool] = useState(sessionStorage.getItem('selectedSchoolAttr') !== null ? sessionStorage.getItem('selectedSchoolAttr') : '');
  const [selectedAttribute, setSelectedAttribute] = useState(sessionStorage.getItem('selectedAttribute') !== null ? sessionStorage.getItem('selectedAttribute') : 'All Attributes');
  const [attrSchools, setAttrSchools] = useState([]);


  const { department } = useParams();
  const navigate = useNavigate();
  const location = useLocation();



  // const colors = ["#D3D3D3","#DD3730","#FF9500","#FFCD00","#9ED10F","#3BA500"];//grey, red, yellow, green
  // const difficultColors= ["D3D3D3","#3BA500","#9ED10F","#FFCD00","#FF9500","#DD3730"];

  const colors = ["#D3D3D3","#e35e59","#ffaa32","#ffd732","#b1da3e","#62b732"];//grey, red, yellow, green
  const difficultColors= ["D3D3D3","#62b732","#b1da3e","#ffd732","#ffaa32","#e35e59"];

  
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCourses = async () => {
        try {
          let data;
          const savedCourses = sessionStorage.getItem('savedCourses');

          if(savedCourses){
            data = JSON.parse(decompressFromUTF16(savedCourses));
          } else{
            setIsLoading(true);
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/getCourses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({department: department === undefined ? 'all' : department}),
            });

            data = await response.json();
            sessionStorage.setItem('savedCourses', compressToUTF16(JSON.stringify(data)));
          }

            setCourses(data);
            if(sessionStorage.getItem('prevNumPages')){
              setNumPages(parseInt(sessionStorage.getItem('prevNumPages')));
              sessionStorage.removeItem('prevNumPages');
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchAttributions = async () => {
      try {
        let attrData;
        const savedAttr = sessionStorage.getItem('savedAttributions');
        if(savedAttr){
          attrData = JSON.parse(savedAttr);
        } else{
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/getAttributions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });

          attrData = await response.json();
          sessionStorage.setItem('savedAttributions',JSON.stringify(attrData));
        }

          setAttrSchools([...new Set(attrData.map(item => item.school))].sort());
          setAttributions(attrData);
      } catch (error) {
          console.error("Error fetching attributions:", error);
      }
  };


    fetchCourses();
    fetchAttributions();
}, [department]);



      const courseClick = (deptNav,nameNav) => {
        nameNav = encodeURIComponent(nameNav);
        sessionStorage.setItem('prevPath', location.pathname);
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        sessionStorage.setItem('prevScrollPosition', scrollPosition);
        sessionStorage.setItem('prevNumPages', numPages);
        navigate(`/${deptNav}/${nameNav}`);
      };

      useEffect(() => {
        const applyFilter = () => {
            const sortFunction = {
                'Popularity': (a, b) => b.numScores - a.numScores,
                'Quality: High-Low': (a, b) => b.avgQuality - a.avgQuality,
                'Quality: Low-High': (a, b) => a.avgQuality === 0 ? 1 : a.avgQuality - b.avgQuality,
                'Difficulty: High-Low': (a, b) => b.avgDifficulty - a.avgDifficulty,
                'Difficulty: Low-High': (a, b) => a.avgDifficulty === 0 ? 1 : a.avgDifficulty - b.avgDifficulty,
            }[filterType] || ((a, b) => 0);

            const filteredCourses = courses
              .sort(sortFunction)
                .filter(course => {
                  if(selectedSchool === ''){
                    return true;
                  }
                  for(const attr of course.attributes){
                    if((attr.attributeSchool === selectedSchool && attr.attributeList.includes(selectedAttribute))){
                      return true;
                    }
                  }
                  return false;
                })
                .filter(course => 
                  course.code.some(code => code.toLowerCase().includes(inputValue.toLowerCase())) ||
                  course.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                  (course.instructors && course.instructors.some(instructor => instructor.fullName.toLowerCase().includes(inputValue.toLowerCase()))) || // TODO: filter so if this condition hits, those results matching are first in the resulting array.
                  inputValue.toLowerCase().split(" ").every(word => course.courseDetails.toLowerCase().includes(word))
                )
                .map(course => {
                  // Assign scores based on match criteria
                  let score = 0;

                  // highest priority matches name
                  if (course.name.toLowerCase().includes(inputValue.toLowerCase())) {
                    score += 5; 
                  }

                  // next if professor matches
                  if (course.instructors && course.instructors.some(instructor => instructor.fullName.toLowerCase().includes(inputValue.toLowerCase()))) {
                    score += 4;
                  }
                  
                  // next  is if it's been reviewed already
                  if(course.reviews.length > 0){
                    score+=3
                  }

                  // next is if code matches
                  if (course.code.some(code => code.toLowerCase().includes(inputValue.toLowerCase()))) {
                    score += 2;
                  }

                  if (inputValue.toLowerCase().split(" ").every(word => course.courseDetails.toLowerCase().includes(word))) {
                    score += 1;
                  }
                  
                  return { course, score };
                })
                .sort((a, b) => b.score - a.score) // Sort by descending score
                .map(item => item.course)
                
                


              sessionStorage.setItem('searchTerm',inputValue);
              sessionStorage.setItem('filterType',filterType);
              sessionStorage.setItem('selectedAttribute',selectedAttribute);
              sessionStorage.setItem('selectedSchoolAttr',selectedSchool);

            setFilteredCourses(filteredCourses);
            
        };

        applyFilter();
    }, [courses, inputValue, filterType, selectedAttribute,numPages,selectedSchool]);





    const inputChange = (event) => {
        setInputValue(event.target.value);
    };

      function findMatchingCode(codes) {
        if(department !== 'all'){
          const deptCode = department.match(/\(([A-Z0-9]+)\)/)[1];
          for (let code of codes) {
            let words = code.split(" ");
            if (words[0] === deptCode) { 
              return code;
            }
          }
          return '';
        } else{
          return codes.length < 3 ? codes.join(', ') : `${codes[0]}, ${codes[1]}...`
        }

      }

      const getAttributes = (school) => {
        return attributions.filter(attr => attr.school === school).map(attr => attr.attribute).sort()
    };


    const loadMoreCourses = () => {
      const newVal = numPages + 1
      setNumPages(newVal);
    }

    useEffect(() => {
      if (!isLoading) {
        setTimeout(() => {
          const savedScrollPosition = sessionStorage.getItem('prevScrollPosition');
          if (savedScrollPosition) {
              window.scrollTo(0, parseInt(savedScrollPosition, 10));
              sessionStorage.removeItem('prevScrollPosition');
          }
        }, 1);
      }
    }, [isLoading]);


    
    return (
          <div className="course-list">
            <div className = "white top-bar">
              <div className="btn-container">
              <button className = "back-btn" onClick={() => {
                  sessionStorage.removeItem('searchTerm');
                  sessionStorage.removeItem('filterType');
                  sessionStorage.removeItem('selectedAttribute');
                  sessionStorage.removeItem('selectedSchoolAttr');
                  sessionStorage.removeItem('savedCourses');
                  sessionStorage.removeItem('savedAttributions');
                  navigate(`/`);
                  }}>Back</button>
              </div> 
              <div className="title-container">
              <h2>{department === (undefined || 'all') ? 'All Courses' : `Courses for ${department}`}</h2>
              </div>
            </div>
        <div className = "search-bar">
        <input
          type='text'
          className="search-bar-input"
          placeholder="search by code, name, professor, or keywords"
          value={inputValue}
          onChange={inputChange}
      />

      <div className="dropDown-container">
      <Dropdown
          title={filterType}
        >
          <Dropdown.Item
            key='Popularity'
            className="smaller-width-main"
            onClick={() => setFilterType('Popularity')}
          >
            Popularity
          </Dropdown.Item>
          <Dropdown.Item
            key='Quality: High-Low'
            className="smaller-width-main"
            onClick={() => setFilterType('Quality: High-Low')}
          >
            Quality: High-Low
          </Dropdown.Item>
          <Dropdown.Item
            key='Quality: Low-High'
            className="smaller-width-main"
            onClick={() => setFilterType('Quality: Low-High')}
          >
            Quality: Low-High
          </Dropdown.Item>
          <Dropdown.Item
            key='Difficulty: High-Low'
            className="smaller-width-main"
            onClick={() => setFilterType('Difficulty: High-Low')}
          >
            Difficulty: High-Low
          </Dropdown.Item>
          <Dropdown.Item
            key='Difficulty: Low-High'
            className="smaller-width-main"
            onClick={() => setFilterType('Difficulty: Low-High')}
          >
            Difficulty: Low-High
          </Dropdown.Item>
        </Dropdown>

        <Dropdown
          title={selectedAttribute}
        >
          <Dropdown.Item key='all' onClick={() => {setSelectedAttribute('All Attributes'); setSelectedSchool('')}}>All Attributes</Dropdown.Item>
          {attrSchools.map((school) => (
            <Dropdown.Item key={school}>
              {school}
              
              <Dropdown.Submenu className="smaller-width-sub">
                {getAttributes(school).map((attribute, index) => (
                  <Dropdown.Item key={index} onClick={() => {setSelectedAttribute(attribute); setSelectedSchool(school)}}>
                    {attribute}
                  </Dropdown.Item>
                ))}
              </Dropdown.Submenu>
            </Dropdown.Item>
          ))}
        </Dropdown>


      </div>
    
      

            
      </div>

      {isLoading &&    
        <div className ="loadingScreen">
          <ReactLoading type="bars" color="#606E52"
        height={160} width={80} />
        </div>
      }

      <div className="course-buttons">
      {[...filteredCourses].splice(0,(filteredCourses.length > 50*numPages ? 50*numPages : filteredCourses.length)).map((course) => (
        <li key={course.id}>
          <div className="course-preview" onClick={() => courseClick(department, course.name)}>


          <div className="course-stats-container">
            <div className="ratings-parent">
              <div className="rating-container">
                  <p className="rating-label">Quality:</p>
                  <div className="rating-box" style={{backgroundColor: colors[Math.round(course.avgQuality)]}}>
                    <p className="rating-box-num">{course.avgQuality > 0 ? course.avgQuality.toFixed(1) : 'N/A'}</p>
                  </div>
                </div>
                <div className="rating-container">
                  <p className="rating-label">Difficulty:</p>
                  <div className="rating-box" style={{backgroundColor: (course.avgDifficulty === 0 ? "#D3D3D3" : difficultColors[Math.round(course.avgDifficulty)])}}>
                    <p className="rating-box-num">{course.avgDifficulty > 0 ? course.avgDifficulty.toFixed(1) : 'N/A'}</p>
                  </div>
                </div>
            </div>
            {course.numScores > 0 &&
              <div className="review-num-display">{course.numScores} reviews</div>
            }
            
          </div>




            <div id="rest-of-li">
              <button className="course-btn">{course.name}</button>
              <span className="course-code">{findMatchingCode(course.code)}</span>
            </div>
          </div>
        </li>

        ))}
        </div>
        {(filteredCourses.length > 50*numPages) &&
          <div id='viewMore' onClick={loadMoreCourses}>View More...</div>
        }
        
        </div>
        
    )
}

