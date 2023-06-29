import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Latex from 'react-latex'
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
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionDetails, setQuestionDetails] = useState(null);

  const [newCourse, setNewCourse] = useState("");
  const [newCode, setNewCode] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState();
  const [number, setNumber] = useState();
  const [topicN, setTopicN] = useState("");
  const [questionNumber, setQuestionNumber] = useState();

  const [correctAnswer, setCorrectAnswer] = useState();
  const [solution, setSolution] = useState("");
  const [checked, setChecked] = useState(false);
  const [questionChecked, setQuestionChecked] = useState(false);

  const [selectedFile, setSelectedFile] = useState();
  const [text, setText] = useState("");
  const [parts, setParts] = useState([]);
  const [type, setType] = useState(".");
  const [upperChecked, setUpperChecked] = useState(false);
  const prodChoices = ['', 'A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.']

  const [link, setLink] = useState("")
  const [choices, setChoices] = useState("4")
  const [pdf_id, setPDF_ID] = useState("")
  const [exam, setExam] = useState([]);

  useEffect(() => {
    if (selectedCourse) {

      if (selectedExam && !questionChecked) {
        axios.get(`https://testing-387121.uc.r.appspot.com/exams/${selectedExam}/questions`)
          .then((res) => setQuestions(res.data))
          .catch(err => console.error(err))
        return
      }
      if (selectedTopic) {
        axios.get(`https://testing-387121.uc.r.appspot.com/courses/${selectedCourse}/${selectedTopic}/questions/`)
          .then((res) => setQuestions(res.data))
          .catch(err => console.error(err));
        return
      }

      if (selectedSemester) {
        // Fetch exams for selected course and semester
        axios.get(`https://testing-387121.uc.r.appspot.com/courses/${selectedCourse}/${selectedSemester}/exams/`)
          .then(res => setExams(res.data))
          .catch(err => console.error(err));
        return;
      }

      // Fetch general topics
      axios.get('https://testing-387121.uc.r.appspot.com/topics/')
        .then(res => setTopics(res.data))
        .catch(err => console.error(err));
      axios.get(`https://testing-387121.uc.r.appspot.com/courses/${selectedCourse}/topics/`)
        .then(res => setCourseTopics(res.data))
        .catch(err => console.error(err));
      // Fetch semesters for selected course
      axios.get(`https://testing-387121.uc.r.appspot.com/courses/${selectedCourse}/semesters/`)
        .then(res => setSemesters(res.data))
        .catch(err => console.error(err));
      return;
    } else {
      setTopics([]);
      setExams([]);
      setSemesters([]);
    }

    // Fetch all courses
    axios.get('https://testing-387121.uc.r.appspot.com/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, [selectedCourse, selectedSemester, selectedTopic, selectedExam, questionChecked]);

  useEffect(() => {
    const splitQuestion = () => {
      if (text === "") {
        return
      }
      let arr = []
      let choices = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'f']
      if (upperChecked) {
        choices = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']
      }
      let left = ''
      let right = ''
      switch (type) {
        case '.':
          right = '.'
          break
        case '()':
          left = '('
          right = ')'
          break
        case ')':
          right = ')'
          break
        default:
          break
      }
      let prev = 0
      for (let i = 1; i < choices.length; i++) {
        let index = text.indexOf(left + choices[i] + right)
        if (index === -1) {
          arr.push(text.substring(prev, text.length).replace(left + choices[i - 1] + right, '').trim())
          break
        }
        arr.push(text.substring(prev, index).replace(left + choices[i - 1] + right, '').trim())
        prev = index
      }
      console.log(arr)
      setParts(arr);
    }
    splitQuestion();
  }, [text, type, upperChecked])

  const handleCourseSelect = (e) => {
    const c = e.target.value;
    setSelectedCourse(c);
    setCourseName(courses.find((id) => id.id === c));
    setSelectedSemester(null);
  };
  const handleExamSelect = (e) => {
    const c = e.target.value;
    setSelectedExam(c);
  }
  const handleQuestionSelect = (e) => {
    const c = e.target.value;
    setSelectedQuestion(c);
    setQuestionDetails(questions.find((id) => id.id === c));

  }

  const handleChecked = () => {
    setChecked(!checked);
    setSelectedSemester(null);
    setSelectedTopic(null);
    setQuestionChecked(false);
    setUpperChecked(false);
  }

  const handleSemesterSelect = (e) => {
    const c = e.target.value;
    setSelectedSemester(c);
  };

  const handleTopicChange = (selectedTopic) => {
    setSelectedTopics(selectedTopic.map(topic => topic.value));
  };
  const handleQuestionTopicChange = (selectedTopic) => {
    setSelectedQuestionTopics(selectedTopic.map(topic => topic.value));
  };


  const addTopic = () => {
    if (topicN === "") {
      alert("Enter a topic name");
      return;
    }

    axios.post('https://testing-387121.uc.r.appspot.com/topic/', { name: topicN })
      .then((res) => (alert("Added topic")))
      .catch((err) => (alert(err)));
    setTopicN("");
  }

  const addCourse = () => {
    if (newCode === "" || newCourse === "") {
      alert("Enter all data");
      return;
    }

    axios.post('https://testing-387121.uc.r.appspot.com/course/', { code: newCode, name: newCourse })
      .then((res) => (alert("Added course")))
      .catch((err) => (alert(err)));
    setSeason("");
    setYear();
    setNumber();
  }

  const assignTopics = () => {
    axios.post('https://testing-387121.uc.r.appspot.com/course-topics/', { course: selectedCourse, topics: selectedTopics })
      .then((res) => (alert("Added topics")))
      .catch((err) => (alert(err)));
    setSelectedTopics([]);
  }

  const addExam = () => {
    if (season === "" || year === "" || !number) {
      alert("Enter all data");
      return;
    }

    axios.post('https://testing-387121.uc.r.appspot.com/exam/', { course: selectedCourse, season: season, year: year, number: number })
      .then((res) => (alert("Added exam")))
      .catch((err) => (alert(err)));
    setNewCode("");
    setNewCourse("");
  }

  const addQuestion = () => {
    axios.post('https://testing-387121.uc.r.appspot.com/question/', {
      course: selectedCourse, exam: selectedExam, topics: selectedQuestionTopic,
      number: questionNumber, body: parts[0], answerChoices: parts.slice(1, parts.length), correctChoiceIndex: correctAnswer, solutionVideoLink: solution
    })
      .then((res) => (alert("Added Question")))
      .catch((err) => (alert(err)));
  }

  const filteredTopics = () => {
    let temp = courseTopics.map(topic => topic.name)
    return topics.filter((topic) => !temp.includes(topic.name))
  }

  const uploadQuestion = async () => {
    const formData = new FormData();

    formData.append('file', selectedFile);

    axios.post('https://testing-387121.uc.r.appspot.com/convert', formData)
      .then((resp) => {
        setText(resp.data.text)
      })
      .catch((err) => alert(err))
  }

  const handlePartChange = (index, value) => {
    const updatedPartStates = [...parts];
    updatedPartStates[index] = value;
    setParts(updatedPartStates);
  };

  const uploadViaLink = async () => {
    if (link == "") throw Error
    axios.post('https://localhost:8080/convert-link', {link, choices})
    .then((questions) => {
      console.log(questions)
    }).catch ((err) => {
      console.alert(err)
    })
  }

  const uploadViaFile = async () => {
    const file = new FormData();
    file.append('file', selectedFile)
    console.log("posting")
    console.log(selectedFile)
    const resp = await axios.post('http://localhost:8080/convert-file', file)
    console.log(resp)
    setPDF_ID(resp.data.pdf_id)
    console.log(pdf_id)
    axios.post('http://localhost:8080/convert-id', {pdf_id, choices})
    .then((res) => {
      console.log(res)
      setExam(res.data)
    }).catch ((err) => {
      console.alert(err)
    })
  }

  const test = async () => {
    console.log("test")
    axios.post('http://localhost:8080/convert-id', {pdf_id, choices})
    .then((res) => {
      console.log(res)
      setExam(res.data)
    }).catch ((err) => {
      alert(err)
    })
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
                        {questions.map(question => (
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
      <div className='break'></div>
      <div className="column3">
        {questionChecked && <div>
          <h4> Add a Question</h4>
          <p>Number</p>
          <input type="number" value={questionNumber} onChange={(e) => setQuestionNumber(e.target.value)} />
          <input name="selectedFile" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
          <select onChange={(e) => setType(e.target.value)}>
            <option value={"."}>A. or a.</option>
            <option value={"()"}>(A) or (a)</option>
            <option value={")"}>A) or a)</option>
          </select>
          <input type='checkbox' id='case' onChange={(e) => setUpperChecked(!upperChecked)} />
          <label for='case'>Uppercase Letters</label>
          <button onClick={uploadQuestion}>Submit</button> <br></br>
          {parts.length !== 0 && <div className="editor">
            <div className='left'>
              {parts.map((part, index) => (
                <p key={index}>
                  <textarea rows="4" cols="100" type="text" value={part} onChange={(e) => handlePartChange(index, e.target.value)} />
                  <br />
                </p>
              ))}
            </div>
            <div className='right'>
              {parts.map((part, index) => (
                <p className="part">{prodChoices[index]} <Latex displayMode={false}>{part}</Latex> <br /></p>
              ))}
            </div>
          </div>}

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
          <input type="number" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} />
          {/*  Youtube Link */}
          <p>Solution</p>
          <input type="text" value={solution} onChange={(e) => setSolution(e.target.value)} />
          <br></br>
          <button onClick={addQuestion}>Add Question</button>

        </div>}
        {selectedQuestion && selectedExam && !questionChecked && <div className="displayQuestion">
          <h3> Selected Question</h3>
          <h4>{courseName.code} Exam {selectedSemester.season} Question {questionDetails.number}</h4>

          <p>{questionDetails.number}. <Latex>{questionDetails.body}</Latex></p>
          {questionDetails.answerChoices.map((choice, index) => (
                <p className="part">{prodChoices[index+1]} <Latex displayMode={false}>{choice}</Latex> <br /></p>
              ))}
          

        </div>}

      </div>
      <div className="column4">
        <div>
          <h3> Add an Exam</h3>
            <div>
              <label for="choices-dropdown">Select choices: </label>
              <select onChange={(e) => setChoices(e.target.value)}>
                <option value={"4"}>4</option>
                <option value={"5"}>5</option>
                <option value={"6"}>6</option>
              </select>
            </div>
            <h4>Upload Via Link</h4>
            <div>
              <label for="pdf_link">Enter a PDF Link: </label>
              <input
                type="text"
                id="pdf-link" 
                onChange={(e) => setLink(e.target.value)}/>
            </div>
            <button onClick={uploadViaLink}>Upload Link</button>
            <h4>Upload Via File</h4>
            <input name="selectedFile" type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <button onClick={uploadViaFile}>Upload File</button>
            <h4>Test</h4>
            <div>
              <label for="pdf_id">Enter a PDF ID: </label>
              <input
                type="text"
                id="pdf-id" 
                onChange={(e) => setPDF_ID(e.target.value)}/>
            </div>
            <button onClick={test}>Test</button>
        </div>
        {exam.length !== 0 && <div className="editor">
            <div className='left'>
              {exam.map((question, qIndex) => (
                <p key={qIndex}>
                  <textarea rows="4" cols="100" type="text" value={question[0].content}/>
                  <br />
                </p>
              ))}
            </div>
          </div>}
      </div>
        
    </div>
  );
}

export default App;