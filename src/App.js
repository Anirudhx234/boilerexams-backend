import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseN, setSelectedCourseN] = useState("");

  const [newCourse, setNewCourse] = useState("");
  const [newCode, setNewCode] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState("");
  const [number, setNumber] = useState();

  useEffect(() => {
    if (selectedCourse) {
      // Fetch topics for selected course
      axios.post('http://localhost:5000/get-topics/', { course: selectedCourse })
        .then(res => setTopics(res.data))
        .catch(err => console.error(err));

      axios.post('http://localhost:5000/get-exams/', { course: selectedCourse })
        .then(res => setExams(res.data))
        .catch(err => console.error(err));

      axios.post('http://localhost:5000/get-semesters/', { course: selectedCourse })
        .then(res => setSemesters(res.data))
        .catch(err => console.error(err));
    } else {
      setTopics([]);
      setExams([]);
      setSemesters([]);
    }

    // Fetch all courses
    axios.get('http://localhost:5000/get-courses/')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, [selectedCourse]);

  const handleCourseSelect = (e) => {
    const c = e.target.value;
    setSelectedCourse(c);
    //setSelectedCourseN(c.name);
  };

  const addCourse = () => {
    if (newCode === "" || newCourse === "") {
      alert("Enter all data");
      return;
    }

    axios.post('http://localhost:5000/add-course/', { code: newCode, name: newCourse })
      .then((res) => (alert(res.data)))
      .catch((err) => (alert(err)));
  }

  const addExam = () => {
    if (season === "" || year === "" || !number) {
      alert("Enter all data");
      return;
    }

    axios.post('http://localhost:5000/add-exam/', { course: selectedCourse, season: season, year: year, number: number })
      .then((res) => (alert(res.data)))
      .catch((err) => (alert(err)));
  }

  return (
    <div className="body">
      <div className="coumn1">
        <div>
          <h3>Select a Course</h3>
          <select onChange={handleCourseSelect}>
            <option value="">Select a course...</option>
            {courses.map(course => (
              <option value={course._id}>{course.name}</option>
            ))}
          </select>
        </div>
        {selectedCourse && (
          <>
            <div>
              <div>
                <h4>Select a Topic</h4>
                <select>
                  {topics.map(topic => (
                    <option value={topic._id}>{topic.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <h4>Select a Semester</h4>
                <select>
                  {semesters.map(semester => (
                    <option key={semester._id} value={semester._id}>{semester.semester} {semester.year}</option>
                  ))}
                </select>
              </div>
              <div>
                <h4>Select an Exam</h4>
                <select>
                  <option value="">Select an exam...</option>
                  {exams.map(exam => (
                    <option value={exam}>{exam}</option>
                  ))}
                </select>
              </div>
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
          <h4>Add an Exam for {selectedCourse}</h4>
          <p>Season</p>
          <input type="text" value={season} onChange={(e) => setSeason(e.target.value)} />
          <p>Year</p>
          <input type="text" value={year} onChange={(e) => setYear(e.target.value)} />
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