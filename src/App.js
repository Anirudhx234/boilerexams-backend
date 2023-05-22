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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);

  const [newCourse, setNewCourse] = useState("");
  const [newCode, setNewCode] = useState("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState();
  const [number, setNumber] = useState();
  const [topicN, setTopicN] = useState("");

  useEffect(() => {
    if (selectedCourse) {
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

      if (selectedSemester) {
        // Fetch exams for selected course and semester
        axios.post('http://localhost:5000/get-exams/', { course: selectedCourse, semester: selectedSemester })
          .then(res => setExams(res.data))
          .catch(err => console.error(err));
      }
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
  }, [selectedCourse, selectedSemester]);

  const handleCourseSelect = (e) => {
    const c = e.target.value;
    setSelectedCourse(c);
    setCourseName(courses.find((id) => id.id === c));
    setSelectedSemester(null);
  };

  const handleSemesterSelect = (e) => {
    const c = e.target.value;
    setSelectedSemester(c);
  };

  const handleTopicChange = (selectedTopic) => {
    setSelectedTopics(selectedTopic.map(topic => topic.value));
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

  const filteredTopics = () => {
    let temp = courseTopics.map(topic => topic.name)
    return topics.filter((topic) => !temp.includes(topic.name))
  }

  return (
    <div className="body">
      <div className="column1">
        <div>
          <h3>Add a Topic</h3>
          <p>Name</p>
          <input type="text" value={topicN} onChange={(e) => setTopicN(e.target.value)} />
          <br></br>
          <button onClick={addTopic}>Add Topic</button>
        </div>
        {selectedCourse && (
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
        )}
      </div>
      <div className="column2">
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
            <div>
              <div>
                <h4>Select a Topic</h4>
                <select>
                  <option value="">Select a topic...</option>
                  {courseTopics.map(topic => (
                    <option value={topic.id}>{topic.name}</option>
                  ))}
                </select>
              </div>
              <div>
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
                <select>
                  <option value="">Select an exam...</option>
                  {exams.map(exam => (
                    <option value={exam.id}>{exam.number}</option>
                  ))}
                </select>
              </div>}
            </div>
          </>
        )}
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