import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [courseTopics, setCourseTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedQuestionTopic, setSelectedQuestionTopics] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [values, setValues] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionDetails, setQuestionDetails] = useState(null);

  const [newCourse, setNewCourse] = useState("");
  const [newCode, setNewCode] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState();
  const [number, setNumber] = useState();
  const [topicN, setTopicN] = useState("");
  const [questionNumber, setQuestionNumber] = useState();
  const [body, setBody] = useState("");

  const [choice1, setChoice1] = useState("");
  const [choice2, setChoice2] = useState("");
  const [choice3, setChoice3] = useState("");
  const [choice4, setChoice4] = useState("");
  const [choice5, setChoice5] = useState("");

  const [answerChoices, setAnswerChoices] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState();
  const [solution, setSolution] = useState("");
  const [checked, setChecked] = useState(false);
  const [questionChecked, setQuestionChecked] = useState(false);

  useEffect(() => {
    if (selectedCourse) {

      if (selectedExam && !questionChecked) {
        axios.post('http://localhost:5000/get-exam-questions/', { exam: selectedExam })
          .then((res) => setQuestions(res.data))
          .catch(err => console.error(err))
        return
      }
      if (selectedTopic) {
        axios.post('http://localhost:5000/get-topic-questions/', { topic: selectedTopic, course: selectedCourse })
          .then((res) => setQuestions(res.data))
          .catch(err => console.error(err));
        return
      }

      if (selectedSemester) {
        // Fetch exams for selected course and semester
        axios.post('http://localhost:5000/get-exams/', { course: selectedCourse, semester: selectedSemester })
          .then(res => setExams(res.data))
          .catch(err => console.error(err));
        return;
      }

      // Fetch general topics
      axios.get('http://localhost:5000/get-topics/')
        .then(res => setTopics(res.data))
        .catch(err => console.error(err));
      axios.post('http://localhost:5000/get-course-topics/', { course: selectedCourse })
        .then(res => setCourseTopics(res.data))
        .catch(err => console.error(err));
      // Fetch semesters for selected course
      axios.post('http://localhost:5000/get-semesters/', { course: selectedCourse })
        .then(res => setSemesters(res.data))
        .catch(err => console.error(err));
      return;
    } else {
      setTopics([]);
      setExams([]);
      setSemesters([]);
    }

    // Fetch all courses
    axios.get('http://localhost:5000/get-courses/')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, [selectedCourse, selectedSemester, selectedTopic, selectedExam, questionChecked]);

  const handleCourseSelect = (e) => {
    const c = e.target.value;
    setSelectedCourse(c);
    setCourseName(courses.find((id) => id.id === c));
    setSelectedSemester(null);
  };
  const handleExamSelect = (e) => {
    const c = e.target.value;
    setSelectedExam(c);
    setExamDetails(exams.find((id) => id.id === c));
  }
  const handleQuestionSelect = (e) => {
    const c = e.target.value;
    setSelectedQuestion(c);
    setQuestionDetails(questions.find((id) => id.id === c));
    
  }
  const handleAddChoices = () => {
    if (choice1 === "" || choice2 === "" || choice3 === "" || choice4 === "" ) {
      alert("Enter all answer choices");
      return;
    }
    const newValues = [choice1, choice2, choice3, choice4, choice5];
    setAnswerChoices(newValues);
    alert("Added answer choices");
  };

  const handleChecked = () => {
    setChecked(!checked);
    setSelectedSemester(null);
    setSelectedTopic(null);
  }

  const handleSemesterSelect = (e) => {
    const c = e.target.value;
    setSelectedSemester(c);
  };

  const handleTopicChange = (selectedTopic) => {
    setSelectedTopics(selectedTopic.map(topic => topic.value));
  };
  const handleQuestionTopicChange = (selectedTopic) => {
    setSelectedQuestionTopics(selectedQuestionTopic.map(topic => topic.value));
  };


  const addTopic = () => {
    if (topicN === "") {
      alert("Enter a topic name");
      return;
    }

    axios.post('http://localhost:5000/add-topic/', { name: topicN })
      .then((res) => (alert("Added topic")))
      .catch((err) => (alert(err)));
    setTopicN("");
  }

  const addCourse = () => {
    if (newCode === "" || newCourse === "") {
      alert("Enter all data");
      return;
    }

    axios.post('http://localhost:5000/add-course/', { code: newCode, name: newCourse })
      .then((res) => (alert("Added course")))
      .catch((err) => (alert(err)));
    setSeason("");
    setYear();
    setNumber();
  }

  const assignTopics = () => {
    axios.post('http://localhost:5000/add-course-topics/', { course: selectedCourse, topics: selectedTopics })
      .then((res) => (alert("Added topics")))
      .catch((err) => (alert(err)));
    setSelectedTopics([]);
  }

  const addExam = () => {
    if (season === "" || year === "" || !number) {
      alert("Enter all data");
      return;
    }

    axios.post('http://localhost:5000/add-exam/', { course: selectedCourse, season: season, year: year, number: number })
      .then((res) => (alert("Added exam")))
      .catch((err) => (alert(err)));
    setNewCode("");
    setNewCourse("");
  }

  const addQuestion = () => {
    axios.post('http://localhost:5000/add-question/', { course: selectedCourse, exam: selectedExam, topics: selectedQuestionTopic,
    number: questionNumber, body: body, answerChoices: answerChoices, correctAnswer: correctAnswer, solution: solution })
      .then((res) => (alert("Added Question")))
      .catch((err) => (alert(err)));
  }

  const filteredTopics = () => {
    let temp = courseTopics.map(topic => topic.name)
    return topics.filter((topic) => !temp.includes(topic.name))
  }

  return (
    <div className="body">
      <div className="column1">
        <div>
          <div>
            <h3>Select a Course</h3>
            <select onChange={handleCourseSelect}>
              <option value="">Select a course...</option>
              {courses.map(course => (
                <option value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
        {selectedCourse && (
          <>
            <input type='checkbox' id='toggle' value={checked} onChange={(e) => (handleChecked())} />
            <label for='toggle'>Select by Topic</label>
            <div>
              {checked && <div>
                <h4>Select a Topic</h4>
                <select onChange={(e) => setSelectedTopic(e.target.value)}>
                  <option value="">Select a topic...</option>
                  {courseTopics.map(topic => (
                    <option value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>}
              <div>
          <h3>Add a Topic</h3>
          <p>Name</p>
          <input type="text" value={topicN} onChange={(e) => setTopicN(e.target.value)} />
          <br></br>
          <button onClick={addTopic}>Add Topic</button>
        </div>
        {selectedCourse && (<div>
          <div>
            <h4>Select Topics for {courseName.name}</h4>
            <Select
              isMulti
              name="colors"
              // Topics already assigned to the course are not shown here. They can be seen in the middle column under Select a Topic.
              options={filteredTopics().map(topic => ({
                value: topic.id,
                label: topic.name
              }))}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleTopicChange}
            />
            <button onClick={assignTopics}>Assign Topics</button>
           </div>
          </div>
          )}
              {!checked && <div><div>
                <h4>Select a Semester</h4>
                <select onChange={handleSemesterSelect}>
                  <option value="">Select a semester...</option>
                  {semesters.map(semester => (
                    <option value={semester.id}>{semester.season} {semester.year}</option>
                  ))}
                </select>
              </div>
                {selectedSemester && <div>
                  <h4>Select an Exam</h4>
                  <select onChange={handleExamSelect}>
                    <option value="">Select an exam...</option>
                    {exams.map(exam => (
                      <option value={exam.id}>{exam.number}</option>
                    ))}
                  </select>
                  
                  {selectedExam && <div>
                    <input type='checkbox' id='questionToggle' value={questionChecked} onChange={(e) => (setQuestionChecked(!questionChecked))} />
                    <label for='questionToggle'>Add a Question</label>
                    {!questionChecked && <div>
                      <h4>Select a Question</h4>
                      <select onChange={handleQuestionSelect}>
                        <option value="">Select an Question...</option>
                        {questions.map( question => (
                          <option value={question.id}>{question.number}</option>
                        ))}
                      </select>
                    </div>}
                  </div>}
                  
                </div>}</div>}
            </div>
          </>
        )}
      </div>
      <div className="column2">
        {questionChecked && <div>
                      <h4> Add a Question</h4>
                      <p>Number</p>
                      <input type = "number" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
                      <p>Body</p>
                      <input type = "text" value={body} onChange={(e) => setBody(e.target.value)} />

                      <p>Answer Choice 1</p>
                      <input type = "text" value={choice1} onChange={(e) => setChoice1(e.target.value)} />
                      <p>Answer Choice 2</p>
                      <input type = "text" value={choice2} onChange={(e) => setChoice2(e.target.value)} />
                      <p>Answer Choice 3</p>
                      <input type = "text" value={choice3} onChange={(e) => setChoice3(e.target.value)} />
                      <p>Answer Choice 4</p>
                      <input type = "text" value={choice4} onChange={(e) => setChoice4(e.target.value)} />
                      <p>Answer Choice 5</p>
                      <input type = "text" value={choice5} onChange={(e) => setChoice5(e.target.value)} />
                      <br></br>
                      <button onClick={handleAddChoices}>Change Answer Choices</button>

                      <h4>Add Topics for Question</h4>
                      <Select
                        isMulti
                        name="colors"
                        // Topics already assigned to the course are not shown here. They can be seen in the middle column under Select a Topic.
                        options={courseTopics.map(topic => ({
                          value: topic.id,
                          label: topic.name
                        }))}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleQuestionTopicChange}
                      />
                      {/* <button onClick={assignTopics}>Assign Topics</button> */}

                      <p>Correct Answer</p>
                      <input type = "number" value = {correctAnswer} onChange = {(e) => setCorrectAnswer(e.target.value)} />
                      {/*  Youtube Link */}
                      <p>Solution</p>
                      <input type = "text" value = {solution} onChange = {(e) => setSolution(e.target.value)} />
                      <br></br>
                      <button onClick={addQuestion}>Add Question</button>
                  
                    </div>}
                    {selectedQuestion && selectedExam && !questionChecked && <div>
                      <h3> Selected Question</h3>
                      <h4>{courseName.code} Exam {selectedSemester.season} Question {questionDetails.number}</h4>

                      <p>{questionDetails.number}. {questionDetails.body}</p>
                      <p><span class="tab"></span>a. {questionDetails.answerChoices[0]} </p>
                      <p><span class="tab"></span>b. {questionDetails.answerChoices[1]} </p>
                      <p><span class="tab"></span>c. {questionDetails.answerChoices[2]} </p>
                      <p><span class="tab"></span>d. {questionDetails.answerChoices[3]} </p>
                      {questionDetails.answerChoices[4] && <div>
                        <p><span class="tab"></span>e. {questionDetails.answerChoices[4]} </p>
                        </div>}

                      <h4>Question Topics</h4>
                      
                      </div>}

      </div>
      <div className="column3">
        <div>
          <h3>Add a Course</h3>
          <p>Course Code</p>
          <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          <p>Course Name</p>
          <input type="text" value={newCourse} onChange={(e) => setNewCourse(e.target.value)} />
          <br></br>
          <button onClick={addCourse}>Add Course</button>
        </div>
        {selectedCourse && <div><div>
          <h4>Add an Exam for {courseName.name}</h4>
          <p>Season</p>
          <select onChange={(e) => setSeason(e.target.value)}>
            <option value='FALL'>Fall</option>
            <option value='SPRING'>Spring</option>
          </select>
          <p>Year</p>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          <p>Exam Number</p>
          <input type="number" value={number} onChange={(e) => setNumber(e.target.value)} />
          <br></br>
          <button onClick={addExam}>Add Exam</button>
        </div>
        </div>}

      </div>
    </div>
  );
}

export default App;