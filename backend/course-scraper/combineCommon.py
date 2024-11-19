# TO SET UP VIRTUAL ENVIORNMENT: source ./backend/.venv/bin/activate
# TO DEACTIVE VIRTUAL ENVIONMENT: deactivate
# TO RUN: python "./backend/course-scraper/combineCommon.py"
import os

from fuzzywuzzy import fuzz
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))

db = client["RateMyCourse"]

coursesDB = db["courses"]


correct_matches = db["correct_matches"]
previous_matches = list(correct_matches.find())
existing_pairs_CM = set()
# Populate the set with name pairs from `previous_matches`
# has merge because that says which one takes the name if similar names
for doc in previous_matches:
    name1 = doc.get("name1")
    name2 = doc.get("name2")
    merge = doc.get("merge")
    existing_pairs_CM.add((name1, name2, merge))

    #order matters here so switch
    if merge == 1:
        existing_pairs_CM.add((name2, name1, 2))
    else:
        existing_pairs_CM.add((name2, name1, 1))


match_false_positives = db["match_false_positives"]
false_positive_docs = list(match_false_positives.find())
existing_pairs_FP = set()

# Populate the set with name pairs from `false_positive_docs`
for doc in false_positive_docs:
    name1 = doc.get("name1")
    name2 = doc.get("name2")
    existing_pairs_FP.add((name1, name2))
    existing_pairs_FP.add((name2, name1))


#all courses to go through
documents = list(coursesDB.find())
input("\n\nSTEPS FOR USING:\n\nhit return if it is not a match to skip\nIF match:\nenter 1 to merge 1st <- 2nd\nenter 2 to merge 1st -> 2nd\n\nresults will be saved for future use\n\ntype 'exit' to end program\n")



def combine_and_delete(i_doc, j_doc,combineNum):

    i_name = i_doc.get("name")
    j_name = j_doc.get("name")


    #combine instructors
    combined_instructors = i_doc.get("instructors") + j_doc.get("instructors")
    seen = set()
    unique_instructors = []
    for obj in combined_instructors:
        value = obj["fullName"]
        if value not in seen:
            seen.add(value)
            unique_instructors.append(obj)

    #get most recently offered
    semesterOrder = ["SP","SU","FL"]

    semester_i = i_doc.get("lastOffered")
    semester_type_i = semester_i[:2]  
    year_i = int(semester_i[2:])

    semester_j = j_doc.get("lastOffered")
    semester_type_j = semester_j[:2]  
    year_j = int(semester_j[2:])

    if year_i > year_j:
        last_offered = semester_i
    elif year_i < year_j:
        last_offered = semester_j
    elif semesterOrder.index(semester_type_i) < semesterOrder.index(semester_type_j):
        last_offered = semester_j
    else:
        last_offered = semester_i


    combined_values = {"$set": {
                                "code": list(set(i_doc.get("code") + j_doc.get("code"))),
                                "department": list(set(i_doc.get("department") + j_doc.get("department"))),
                                "instructors": unique_instructors,
                                "lastOffered": last_offered,
                                "numScores": i_doc.get("numScores")+j_doc.get("numScores"),
                                "avgDifficulty": 0 if i_doc.get("numScores")+j_doc.get("numScores") == 0 else ((i_doc.get("numScores")*i_doc.get("avgDifficulty"))+(j_doc.get("numScores")*j_doc.get("avgDifficulty")))/(i_doc.get("numScores")+j_doc.get("numScores")),
                                "avgQuality": 0 if i_doc.get("numScores")+j_doc.get("numScores") == 0 else ((i_doc.get("numScores")*i_doc.get("avgQuality"))+(j_doc.get("numScores")*j_doc.get("avgQuality")))/(i_doc.get("numScores")+j_doc.get("numScores")),
                                "reviews": i_doc.get("reviews") + j_doc.get("reviews")
                                }
                       }
                            

    if combineNum == 1:

        update_query = {"name": i_name}
        delete_action = coursesDB.delete_one({"name": j_name})

    elif combineNum == 2:
        update_query = {"name": j_name}
        delete_action = coursesDB.delete_one({"name": i_name})

    update_action = coursesDB.update_one(update_query, combined_values)

    if update_action.modified_count > 0 and delete_action.deleted_count > 0:
        print('Successful Merger')
    else:
        print("ERROR")
        


    

    #update correct_matches DB in case same pair comes up again so user doesnt need to review

    correct_match = {
        "name1": i_name,
        "name2": j_name,
        "merge": combineNum
    }
    correct_matches.insert_one(correct_match)





try:
    i = 0
    exit_program = False
    while i < len(documents):
        j = i+1
        while j < len(documents):
            i_doc = documents[i]
            j_doc = documents[j]

            i_name = i_doc.get("name")
            j_name = j_doc.get("name")
            
            #skip if i've already compared it in the past and it was a false positive
            if (i_name, j_name) not in existing_pairs_FP:

                #if ive compared it in the past and it was a match, combine according to past combination without wasting user's time
                if (i_name, j_name, 1) in existing_pairs_CM or (i_name, j_name, 2) in existing_pairs_CM:
                    value = 1 if (i_name, j_name, 1) in existing_pairs_CM else 2
                    combine_and_delete(i_doc, j_doc,value)


                elif fuzz.ratio(i_name,j_name) > 75:
                    print("----------------------------------------------")
                    print('Similarity Score: '+str(fuzz.ratio(i_name,j_name)))
                    print(i_name)
                    print(j_name)

                    user_input = input("combine? (1/2/<enter>)")
                    while(user_input != '1' and user_input != '2' and user_input != '' and user_input != 'exit'):
                         user_input = input("combine? (1/2/<enter>)")
                    
                    if user_input == 'exit':
                        exit_program = True
                        break

                    if user_input == '':
                        document = {
                            "name1": i_name,
                            "name2": j_name
                        }
                        match_false_positives.insert_one(document)


                    else:     
                        #updates DB
                        combine_and_delete(i_doc, j_doc,int(user_input))

                        #deleted current iteration from DB so need to skip to not cause errors
                        if user_input == '2':
                            break

                        # if its 1 then delete it from documents so not to compare in future iterations
                        else:
                            del documents[j]

            j += 1

        if exit_program:
            break
        i += 1

    if not exit_program:
        print("\n\nFINISHED DOCUMENTS\n")                    

finally:
    print("\n\nCLOSING CLIENT\n\n")
    client.close()



