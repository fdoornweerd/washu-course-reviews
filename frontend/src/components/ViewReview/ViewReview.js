import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';

function ViewReview({ courseName, review, colors, difficultColors, professor, isSmallWidth }) {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    let previouslyInteracted = false;

    const insertReaction = async (change, isLike) => {
        try {
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/updateReaction`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ courseName: courseName, review_id: review.id, isLike: isLike, change: change }),
          });
          const data = await response.json();
        } catch (error) {
          console.error("Error fetching departments:", error);
        }
      };

      useEffect(() => {
        if(parseInt(localStorage.getItem(review.id)) == -1){
            setDisliked(true);
            previouslyInteracted = true;
        }
        if(parseInt(localStorage.getItem(review.id)) == 1){
            setLiked(true);
            previouslyInteracted = true;
        }
      }, [courseName]);


    const handleLike = () => {
        if(liked){
            localStorage.setItem(review.id,0);
            setLiked(false);
            review.upVotes -= 1;
            insertReaction(-1,true)
        } else{
            localStorage.setItem(review.id,1);
            setLiked(true);
            review.upVotes += 1;
            insertReaction(1,true)
        }
        
    };

    const handleDislike = () => {
        if(disliked){
            localStorage.setItem(review.id,0);
            setDisliked(false);
            review.downVotes -= 1;
            insertReaction(-1,false)
        } else{
            localStorage.setItem(review.id,-1);
            setDisliked(true);
            review.downVotes += 1;
            insertReaction(1,false)
        }
    };


    const includesProfessor = () => {
        for(const instructor of review.instructor){
            if(instructor == professor){
                return true;
            }
        }
        return false;
    }

    return (
        <>
        {(professor == '' || includesProfessor()) && 
            <div className="review">
            {isSmallWidth && 
                <div className='both-containers'>
                   <div className="rating-container">
                       <p className="rating-label">Quality:</p>
                       <div className="rating-box" style={{ backgroundColor: colors[Math.floor(review.quality)] }}>
                           <p className="rating-box-num">{review.quality > 0 ? review.quality : 'N/A'}</p>
                       </div>
                   </div>
                   <div className="rating-container">
                       <p className="rating-label">Difficulty:</p>
                       <div className="rating-box" style={{ backgroundColor: difficultColors[Math.round(review.difficulty - 1)] }}>
                           <p className="rating-box-num">{review.difficulty > 0 ? review.difficulty : 'N/A'}</p>
                       </div>
                   </div>
                </div>
            }
            {!isSmallWidth &&
            <>
                 <div className="rating-container">
                 <p className="rating-label">Quality:</p>
                 <div className="rating-box" style={{ backgroundColor: colors[Math.floor(review.quality)] }}>
                     <p className="rating-box-num">{review.quality > 0 ? review.quality : 'N/A'}</p>
                 </div>
             </div>
             <div className="rating-container">
                 <p className="rating-label">Difficulty:</p>
                 <div className="rating-box" style={{ backgroundColor: difficultColors[Math.round(review.difficulty - 1)] }}>
                     <p className="rating-box-num">{review.difficulty > 0 ? review.difficulty : 'N/A'}</p>
                 </div>
             </div>
             </>
             }
     
            
   
            <div className="review-stack">
                <div className="professor-and-date">
                    <div className="professor-container">
                        <p>{review.instructor.join(', ')}</p>
                    </div>
                    <div id="hours-container">
                        <p>Hours per week outside of course: {review.hours}</p>
                    </div>
                    <div id="date">
                        <p>{review.date}</p>
                    </div>
                </div>
                <div id="review-content">
                    <p>{review.comment}</p>
                </div>
                <div className="like-dislike-container">
                    <div className="like-button" >
                    <span className="ld-count">{review.upVotes}</span>
                    <button 
                        onClick={handleLike}
                        disabled={disliked} 
                        style={{ border: 'none', background: 'none' }}
                    >
                        <FontAwesomeIcon icon={faThumbsUp} className={liked ? 'active' : 'inactive'} style={{ fontSize: '1.5em' }}/>
                    </button>

                    </div>
                    <div className="dislike-button">
                    <span className="ld-count">{review.downVotes}</span>
                    <button 
                        onClick={handleDislike}
                        disabled={liked}
                        style={{ border: 'none', background: 'none' }}
                    >
                        <FontAwesomeIcon icon={faThumbsDown} className={disliked ? 'active' : 'inactive'} style={{ fontSize: '1.5em', position:'relative', top:'0.18em'}}/>
                    </button>

                    </div>
                </div>
            </div>
        </div>
        }
        </>

    );
}

export default ViewReview;
