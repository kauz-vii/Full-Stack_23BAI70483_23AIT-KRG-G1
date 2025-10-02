/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <>
    <h1>Good morning</h1>
    <h2>Good nightt</h2>
    </> //fragment tag
);}

export default App;

/*
(
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
*/

import React, { useState } from "react";
import './App.css'; // Import the CSS file

function MyForm() {
  // State to hold the form input values
  const [formValues, setFormValues] = useState({
    name: "",
    email: ""
  });
  
  // State to hold submitted values
  const [submittedValues, setSubmittedValues] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedValues(formValues); // Store submitted data in state
    console.log("Submitted Values:", formValues); // Display values in console
  };

  return (
  <div className="form-container">
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <input 
        type="text" 
        name="name"
        value={formValues.name}
        onChange={handleChange}
        required
        placeholder=" " // triggers not-empty selector for label
      />
      <label>Name</label>
      {/* <span className="icon">👤</span> // use SVG or font icon here */}
    </div>
    <div className="form-group">
      <input 
        type="email" 
        name="email"
        value={formValues.email}
        onChange={handleChange}
        required
        placeholder=" "
      />
      <label>Email</label>
      {/* <span className="icon">📧</span> // use SVG or font icon here */}
    </div>
    <button type="submit">Submit</button>
  </form>


</div>

);
}

export default MyForm;
