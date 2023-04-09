import { useState } from 'react';
import axios from 'axios';
import data from './courses.json';
import './App.css';

function App() {
  const initial = {
    course: -1,
    topic: "",
    date: "",
    exam: 0,
    question: ""
  }
  const [selectedFile, setSelectedFile] = useState();
  const [keys, setKeys] = useState({topic: 0, date: 0, exam: 0});
  const [inputs, setInputs] = useState(initial);
  const [image, setImage] = useState("");
  const [isImage, setIsImage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, options} = e.target;
    if (name === "selectedFile") {
      setSelectedFile(e.target.files[0]);
      return;
    }
    else if (name === "course") {
      setInputs({
        ...inputs,
        course: value,
        topic: data[value].topics[keys.topic],
        date: data[value].dates[keys.date],
        exam: data[value].exams[keys.exam],
      });
      return;
    }
    setInputs({
      ...inputs,
      [name]: value,
    });
    setKeys({
      ...keys,
      [name]: options.selectedIndex,
    });
  };

  const uploadProblem = () => {
    if (!selectedFile || inputs.course === -1 || inputs.topic === "Random" || inputs.date === "Random" || inputs.exam === "Random" || inputs.question === "" || inputs.question < 1) {
      alert("Enter all/valid data");
      return;
    }
    const formData = new FormData();

    formData.append('file', selectedFile);
    formData.append('course', data[inputs.course].course);
    formData.append('topic', inputs.topic);
    formData.append('date', inputs.date);
    formData.append('exam', inputs.exam);
    formData.append('question', inputs.question);

    axios.post('http://localhost:5000/upload-image/', formData)
      .then(function (response) {
        alert('Success');
      })
      .catch(function (error) {
        alert('Error: ' + error);
      });
  };

  const getQuestion = () => {
    if (inputs.course === -1) {
      alert("Select a course");
      return;
    }
    const formData = new FormData();

    formData.append('course', data[inputs.course].course);
    if (inputs.topic !== "Random" ) {
      formData.append('topic', inputs.topic);
    }
    if (inputs.date !== "Random") {
      formData.append('date', inputs.date);
    }
    if (inputs.exam !== "Random") {
      formData.append('exam', inputs.exam);
    }
    if (inputs.question >= 1) {
      formData.append('question', inputs.question);
    }

    axios.post('http://localhost:5000/get-question/', formData)
      .then(function (response) {
        setIsImage(true);
        setImage(response.data);
      })
      .catch(function (error) {
        alert('Error: No problems found');
      });
  };

  return (
    <div>
      <input name="selectedFile" type="file" onChange={handleInputChange} /> <br></br>
      <select name="course" onChange={handleInputChange}>
        <option value="none" selected disabled hidden>Select a Course</option>
        {
          data.map((obj, index) => {
            return <option value={index}>{obj.course}</option>
          })
        }</select>
      {inputs.course !== -1 && <div>
        <select name="topic" onChange={handleInputChange}>
          {
            data[inputs.course].topics.map((topic, index) => {
              return <option value={topic}>{topic}</option>
            })
          }</select>
        <select name="date" onChange={handleInputChange}>
          {
            data[inputs.course].dates.map((topic, index) => {
              return <option value={topic}>{topic}</option>
            })
          }</select>
        <select name="exam" onChange={handleInputChange}>
          {
            data[inputs.course].exams.map((topic, index) => {
              return <option value={topic}>{topic}</option>
            })
          }</select>
        <input name="question" type="number" placeholder='Question Number' min="1" value={inputs.question} onChange={handleInputChange} />
      </div>} <br></br>
      <button onClick={uploadProblem}>Submit</button> <br/>
      <button onClick={getQuestion}>Get Question</button> <br/>
      {isImage && <img className="image" alt="problem" src={image}/>}
    </div>
  )
}

export default App;