// Import necessary libraries and hooks
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import API_LIST from './API';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Component for the stats page
function Stats() {
    const [taskData, setTaskData] = useState({ completed: 0, pending: 0 });
    const navigate = useNavigate();

    // Function to fetch task data from the API
    const fetchTaskData = async () => {
        try {
            const response = await fetch(`${API_LIST.tasks}`);
            const tasks = await response.json();

            // Count completed and pending tasks
            const completed = tasks.filter(task => task.estadoTarea).length;
            const pending = tasks.length - completed;

            setTaskData({ completed, pending });
        } catch (error) {
            console.error("Error fetching task data:", error);
        }
    };

    useEffect(() => {
        fetchTaskData();
    }, []);

    // Data and options for the Pie chart
    const data = {
        labels: ['Completed', 'Pending'],
        datasets: [
            {
                data: [taskData.completed, taskData.pending],
                backgroundColor: ['#4caf50', '#f44336'],
            },
        ],
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Task Completion Stats</h2>
            <Pie data={data} />
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
                style={{ marginTop: '20px' }}
            >
                Back to Home
            </Button>
        </div>
    );
}

export default Stats;
