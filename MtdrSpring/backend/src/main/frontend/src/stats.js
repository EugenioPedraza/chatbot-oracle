// Stats.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Button, CircularProgress, Box, Paper, Typography } from '@mui/material';
import API_LIST from './API';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Stats() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTareas();
    }, []);

    function loadTareas() {
        fetch(API_LIST)
            .then(response => response.json())
            .then(tareas => {
                const completadas = tareas.filter(tarea => tarea.estadoTarea).length;
                const pendientes = tareas.filter(tarea => !tarea.estadoTarea).length;

                setChartData({
                    labels: ['Completadas', 'Pendientes'],
                    datasets: [{
                        data: [completadas, pendientes],
                        backgroundColor: ['#66BB6A', '#FFA726'],
                        borderColor: ['#43A047', '#FB8C00'],
                        borderWidth: 1,
                    }],
                });
                setLoading(false);
            })
            .catch(error => {
                setError(error.toString());
                setLoading(false);
            });
    }

    return (
        <Box sx={{ 
            p: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            bgcolor: '#121212',
            minHeight: '100vh',
            color: 'white'
        }}>
            <Typography variant="h3" sx={{ mb: 4 }}>
                Estadísticas de Tareas
            </Typography>

            <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{ mb: 4 }}
            >
                Volver al Inicio
            </Button>

            {error && <Typography color="error">{error}</Typography>}
            
            {isLoading ? (
                <CircularProgress />
            ) : (
                <Paper sx={{ 
                    p: 3, 
                    bgcolor: '#303030',
                    maxWidth: 500,
                    width: '100%'
                }}>
                    <Box sx={{ height: 400 }}>
                        {chartData && (
                            <Pie
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            labels: {
                                                color: 'white'
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </Box>
                </Paper>
            )}
        </Box>
    );
}

export default Stats;