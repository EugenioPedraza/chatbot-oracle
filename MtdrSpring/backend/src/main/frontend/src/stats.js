// Stats.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement } from 'chart.js';
import { Button, CircularProgress, Box, Paper, Typography } from '@mui/material';
import API_LIST from './API';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement);

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
            const sprintCompletionTimes = {};
            const sprintPoints = {};
            tareas.forEach((tarea) => {
                const sprintId = `Sprint ${tarea.idsprint}`;
                if (!tareasBySprint[sprintId]) {
                    tareasBySprint[sprintId] = { completadas: 0, pendientes: 0 };
                    sprintCompletionTimes[sprintId] = { totalAssignedTime: 0, totalActualTime: 0, count: 0 };
                    sprintPoints[sprintId] = 0;
                }

                if (tarea.estadoTarea) {
                    tareasBySprint[sprintId].completadas++;
                    sprintPoints[sprintId] += tarea.puntos;
                    if (tarea.fechaInicio && tarea.fechaFin) {
                        const assignedTime = new Date(tarea.fechaVencimiento) - new Date(tarea.fechaAsignacion);
                        const actualTime = new Date(tarea.fechaFin) - new Date(tarea.fechaInicio);
                        sprintCompletionTimes[sprintId].totalAssignedTime += assignedTime;
                        sprintCompletionTimes[sprintId].totalActualTime += actualTime;
                        sprintCompletionTimes[sprintId].count++;
                    }
                } else {
                    tareasBySprint[sprintId].pendientes++;
                }
            });

            // Organize tasks by user for bar chart
            const tareasByUser = {};
            tareas.forEach((tarea) => {
                const userId = tarea.idusuario;
                const user = users.find(user => user.idUsuario === userId);
                const userName = user ? user.fullName.split(' ')[0] : `Usuario ${userId}`;
                if (!tareasByUser[userName]) {
                    tareasByUser[userName] = { completadas: 0, pendientes: 0, totalTime: 0, count: 0 };
                }

                if (tarea.estadoTarea) {
                    tareasByUser[userName].completadas++;
                    if (tarea.fechaInicio && tarea.fechaFin) {
                        const actualTime = new Date(tarea.fechaFin) - new Date(tarea.fechaInicio);
                        tareasByUser[userName].totalTime += actualTime;
                        tareasByUser[userName].count++;
                    }
                } else {
                    tareasByUser[userName].pendientes++;
                }
            });

            const taskCompletionOverTime = {};
            tareas.forEach((tarea) => {
                const assignedDate = new Date(tarea.fechaAsignacion);
                const completedDate = tarea.fechaFin ? new Date(tarea.fechaFin) : null;

                const weekStart = new Date(assignedDate);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                const weekKey = weekStart.toISOString().split('T')[0];

                if (!taskCompletionOverTime[weekKey]) {
                    taskCompletionOverTime[weekKey] = { assigned: 0, completed: 0 };
                }
                taskCompletionOverTime[weekKey].assigned++;

                if (completedDate) {
                    const completedWeekStart = new Date(completedDate);
                    completedWeekStart.setDate(completedWeekStart.getDate() - completedWeekStart.getDay());
                    const completedWeekKey = completedWeekStart.toISOString().split('T')[0];

                    if (!taskCompletionOverTime[completedWeekKey]) {
                        taskCompletionOverTime[completedWeekKey] = { assigned: 0, completed: 0 };
                    }
                    taskCompletionOverTime[completedWeekKey].completed++;
                }
            });

            const cumulativeTaskCompletionOverTime = {};
            let cumulativeAssigned = 0;
            let cumulativeCompleted = 0;
            Object.keys(taskCompletionOverTime).sort().forEach((week) => {
                cumulativeAssigned += taskCompletionOverTime[week].assigned;
                cumulativeCompleted += taskCompletionOverTime[week].completed;
                cumulativeTaskCompletionOverTime[week] = { assigned: cumulativeAssigned, completed: cumulativeCompleted };
            });

            const sortedSprintKeys = Object.keys(sprintCompletionTimes).sort((a, b) => {
                const sprintA = parseInt(a.split(' ')[1]);
                const sprintB = parseInt(b.split(' ')[1]);
                return sprintA - sprintB;
            });

            const sprintCompletionTimeData = {
                labels: sortedSprintKeys,
                datasets: [
                    {
                        label: 'Tiempo Asignado (días)',
                        data: sortedSprintKeys.map(key => sprintCompletionTimes[key].totalAssignedTime / (sprintCompletionTimes[key].count * 86400000)),
                        backgroundColor: '#FFA726',
                    },
                    {
                        label: 'Tiempo Real (días)',
                        data: sortedSprintKeys.map(key => sprintCompletionTimes[key].totalActualTime / (sprintCompletionTimes[key].count * 86400000)),
                        backgroundColor: '#66BB6A',
                    }
                ],
            };

            const taskCompletionOverTimeData = {
                labels: Object.keys(cumulativeTaskCompletionOverTime),
                datasets: [
                    {
                        label: 'Tareas Asignadas',
                        data: Object.values(cumulativeTaskCompletionOverTime).map(t => t.assigned),
                        borderColor: '#FFA726',
                        fill: false,
                    },
                    {
                        label: 'Tareas Completadas',
                        data: Object.values(cumulativeTaskCompletionOverTime).map(t => t.completed),
                        borderColor: '#66BB6A',
                        fill: false,
                    }
                ],
            };

            const userProductivityData = {
                labels: Object.keys(tareasByUser),
                datasets: [
                    {
                        label: 'Tiempo Promedio de Finalización (días)',
                        data: Object.values(tareasByUser).map(u => u.totalTime / (u.count * 86400000)),
                        backgroundColor: '#66BB6A',
                    }
                ],
            };

            const sprintVelocityData = {
                labels: sortedSprintKeys,
                datasets: [
                    {
                        label: 'Puntos Totales Completados',
                        data: sortedSprintKeys.map(key => sprintPoints[key]),
                        backgroundColor: '#66BB6A',
                    }
                ],
            };

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
                    labels: sortedSprintKeys,
                    datasets: [
                        {
                            label: 'Completadas',
                            data: sortedSprintKeys.map(key => tareasBySprint[key].completadas),
                            backgroundColor: '#66BB6A',
                        },
                        {
                            label: 'Pendientes',
                            data: sortedSprintKeys.map(key => tareasBySprint[key].pendientes),
                            backgroundColor: '#FFA726',
                        }
                    ],
                },
                userBar: {
                    labels: Object.keys(tareasByUser),
                    datasets: [
                        {
                            label: 'Completadas',
                            data: Object.values(tareasByUser).map(u => u.completadas),
                            backgroundColor: '#66BB6A',
                        },
                        {
                            label: 'Pendientes',
                            data: Object.values(tareasByUser).map(u => u.pendientes),
                            backgroundColor: '#FFA726',
                        }
                    ],
                },
                sprintCompletionTime: sprintCompletionTimeData,
                taskCompletionOverTime: taskCompletionOverTimeData,
                userProductivity: userProductivityData,
                sprintVelocity: sprintVelocityData,
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Distribución de Tareas</Typography>
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Progreso de Sprints</Typography>
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Progreso de Usuarios</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Bar data={chartData.userBar} options={{ responsive: true, maintainAspectRatio: false }} />
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Tiempo de Finalización de Tareas por Sprint</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Bar data={chartData.sprintCompletionTime} options={{ responsive: true, maintainAspectRatio: false }} />
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Tareas Asignadas y Completadas en el Tiempo</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Line data={chartData.taskCompletionOverTime} options={{ responsive: true, maintainAspectRatio: false }} />
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Comparación de Productividad de Usuarios</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Bar data={chartData.userProductivity} options={{ responsive: true, maintainAspectRatio: false }} />
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Velocidad del Sprint</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Bar data={chartData.sprintVelocity} options={{ responsive: true, maintainAspectRatio: false }} />
                        </Box>
                    </Paper>
                </div>
            )}
        </div>
    );
}

export default Stats;