import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
//import { ContestProvider } from './context/ContestContext';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')); // Create root
root.render(
  <React.StrictMode>
    
      <App />
    
  </React.StrictMode>
);
