import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import "./styles.css";
import "./styles/variables.css";
import "./styles/animations.css";
import "./styles/dashboard.css";
import "./styles/garden.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);
