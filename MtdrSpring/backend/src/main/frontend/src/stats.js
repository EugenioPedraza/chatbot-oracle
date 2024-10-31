// Stats.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Stats() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Statistics</h1>
            {/* Add your stats content here */}
            <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
    );
}

export default Stats;