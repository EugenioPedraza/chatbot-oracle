// Stats.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Button, CircularProgress, Box, Paper, Typography } from '@mui/material';
import API_LIST from './API';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// New endpoint constant for user data
const USERS_API = '/usuarios';

function Stats() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTareas();
    }, []);

    async function loadTareas() {
        try {
            const response = await fetch(API_LIST);
            const tareas = await response.json();
            console.log("Fetched tareas:", tareas);

            // Fetch user data associated with tasks
            const users = await loadUsersForTasks(tareas);

            // Calculate completed and pending tasks for pie chart
            const completed = tareas.filter(t => t.estadoTarea).length;
            const pending = tareas.length - completed;

            // Organize tasks by sprint for bar chart
            const tareasBySprint = {};
            tareas.forEach((tarea) => {
                const sprintId = `Sprint ${tarea.idsprint}`;
                if (!tareasBySprint[sprintId]) {
                    tareasBySprint[sprintId] = { completed: 0, pending: 0 };
                }

                if (tarea.estadoTarea) {
                    tareasBySprint[sprintId].completed++;
                } else {
                    tareasBySprint[sprintId].pending++;
                }
            });

            // Organize tasks by user for bar chart
            const tareasByUser = {};
            tareas.forEach((tarea) => {
                const userId = tarea.idusuario;
                const user = users.find(user => user.idUsuario === userId);
                const userName = user ? user.fullName.split(' ')[0] : `User ${userId}`;
                if (!tareasByUser[userName]) {
                    tareasByUser[userName] = { completed: 0, pending: 0 };
                }

                if (tarea.estadoTarea) {
                    tareasByUser[userName].completed++;
                } else {
                    tareasByUser[userName].pending++;
                }
            });

            // Set chart data for rendering
            setChartData({
                pie: {
                    labels: ['Completadas', 'Pendientes'],
                    datasets: [{
                        data: [completed, pending],
                        backgroundColor: ['#66BB6A', '#FFA726'],
                        borderColor: ['#43A047', '#FB8C00'],
                        borderWidth: 1,
                    }],
                },
                sprintBar: {
                    labels: Object.keys(tareasBySprint),
                    datasets: [
                        {
                            label: 'Completadas',
                            data: Object.values(tareasBySprint).map(s => s.completed),
                            backgroundColor: '#66BB6A',
                        },
                        {
                            label: 'Pendientes',
                            data: Object.values(tareasBySprint).map(s => s.pending),
                            backgroundColor: '#FFA726',
                        }
                    ],
                },
                userBar: {
                    labels: Object.keys(tareasByUser),
                    datasets: [
                        {
                            label: 'Completadas',
                            data: Object.values(tareasByUser).map(u => u.completed),
                            backgroundColor: '#66BB6A',
                        },
                        {
                            label: 'Pendientes',
                            data: Object.values(tareasByUser).map(u => u.pending),
                            backgroundColor: '#FFA726',
                        }
                    ],
                }
            });

            setLoading(false);
        } catch (error) {
            console.error("Error loading tareas:", error);
            setError(error.toString());
            setLoading(false);
        }
    }

    // Fetch user information for each unique user associated with the tasks
    async function loadUsersForTasks(tareas) {
        try {
            // Step 1: Extract unique user IDs from tareas array
            const uniqueUserIds = [...new Set(tareas.map(tarea => tarea.idusuario))].filter(id => id !== undefined);
            console.log("Unique user IDs:", uniqueUserIds);

            // Step 2: Fetch user data for each unique user ID
            const fetchUserData = async (userId) => {
                try {
                    const response = await fetch(`${USERS_API}/${userId}`);
                    if (!response.ok) throw new Error(`Failed to fetch user ${userId}`);
                    return await response.json();
                } catch (error) {
                    console.error(`Error fetching user data for user ID ${userId}:`, error);
                }
            };

            // Step 3: Fetch and map user data to user IDs
            const fetchAllUserData = async () => {
                const userDataArray = await Promise.all(uniqueUserIds.map(id => fetchUserData(id)));
                const userData = userDataArray.filter(data => data); // Filter out any unsuccessful fetches
                console.log("Fetched user data:", userData);
                return userData;
            };

            // Execute fetching
            return await fetchAllUserData();
        } catch (error) {
            console.error("Error loading user data:", error);
            setError(error.toString());
        }
    }

    return (
        <div className="App">
            <h1>Estadísticas de Tareas</h1>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
                style={{ marginBottom: '20px' }}
            >
                Volver al Inicio
            </Button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {isLoading && <CircularProgress />}
            {!isLoading && (
                <div id="maincontent" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper sx={{
                        p: 3,
                        bgcolor: '#303030',
                        maxWidth: 500,
                        width: '100%',
                        mb: 4,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Distribución de Tareas (Pie Chart)</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Pie data={chartData.pie} options={{ responsive: true }} />
                        </Box>
                    </Paper>

                    <Paper sx={{
                        p: 3,
                        bgcolor: '#303030',
                        maxWidth: 500,
                        width: '100%',
                        mb: 4,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Progreso de Sprints (Bar Chart)</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Bar data={chartData.sprintBar} options={{ responsive: true, maintainAspectRatio: false }} />
                        </Box>
                    </Paper>

                    <Paper sx={{
                        p: 3,
                        bgcolor: '#303030',
                        maxWidth: 500,
                        width: '100%',
                        mb: 4,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Progreso de Usuarios (Bar Chart)</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Bar data={chartData.userBar} options={{ responsive: true, maintainAspectRatio: false }} />
                        </Box>
                    </Paper>
                </div>
            )}
        </div>
    );
}

export default Stats;