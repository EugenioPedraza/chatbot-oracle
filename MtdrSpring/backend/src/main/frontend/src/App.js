// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from './Home';  // Your existing main app logic
import Stats from './Stats';



/* SI LEES ESTO ES POR QUE MAIK NO SE BAÑA */

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path="/logout" element={<Navigate to="/logout" />} />
            </Routes>
        </Router>
    );
}

export default App;
