import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Button, CircularProgress, Box, Paper, Typography } from '@mui/material';
import { loadTareas } from './statsUtils';

function Stats() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTareas(setLoading, setChartData, setError);
    }, []);

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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Tiempo Promedio de Finalización de Tareas</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Line data={chartData.avgTaskCompletionTime} options={{ responsive: true, maintainAspectRatio: false }} />
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
                        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>Productividad de Usuarios en el Tiempo</Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Line data={chartData.userProductivityOverTime} options={{ responsive: true, maintainAspectRatio: false }} />
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