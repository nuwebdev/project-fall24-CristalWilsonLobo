import React, { useState } from 'react';
import MBTAMap from './MBTAMap';
import Login from './Login';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="App">
      {isLoggedIn ? (
        <div>
          {/* A header bar to hold title and logout on same line */}
          <div className="header-bar">
            <h1 className="header-title">MBTA Tracker</h1>
            <button
              className="logout-button"
              onClick={() => {
                setIsLoggedIn(false);
                alert('Logged out successfully!');
              }}
            >
              Logout
            </button>
          </div>
          {/* Show MBTAMap when logged in */}
          <MBTAMap />
        </div>
      ) : (
        <>
          {/* If not logged in, just show a title and login form */}
          <div className="header-bar">
            <h1 className="header-title">MBTA Tracker</h1>
          </div>
          <Login onLogin={setIsLoggedIn} />
        </>
      )}
    </div>
  );
}

export default App;

