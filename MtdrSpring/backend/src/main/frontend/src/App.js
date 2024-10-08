import React, { useState, useEffect } from 'react';
import NewItem from './NewItem';
import API_LIST from './API';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, Accordion, AccordionSummary, AccordionDetails, Typography, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskIcon from '@mui/icons-material/Task';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddTaskIcon from '@mui/icons-material/AddTask';
import Moment from 'react-moment';

function App() {
    const [isLoading, setLoading] = useState(false);
    const [isInserting, setInserting] = useState(false);
    const [tareas, setTareas] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newDescription, setNewDescription] = useState('');
    const [newHours, setNewHours] = useState('');
    const [openNewItemDialog, setOpenNewItemDialog] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            if (response.ok){
                window.location.href = '/login';
            } else {
                console.error('Error al cerrar sesión');
            }
        }             catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    useEffect(() => {
        loadTareasSprintsAndUsuarios();
    }, []);

    function agruparPorSprint() {
        const sprintsAgrupados = tareas.reduce((acc, tarea) => {
            const sprint = tarea.nombreSprint;
            if (!acc[sprint]) {
                acc[sprint] = { pendientes: [], completadas: [] };
            }
            if (tarea.estadoTarea) {
                acc[sprint].completadas.push(tarea);
            } else {
                acc[sprint].pendientes.push(tarea);
            }
            return acc;
        }, {});
        const sprintsOrdenados = Object.keys(sprintsAgrupados).sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true });
        });
        return sprintsOrdenados.reduce((acc, sprint) => {
            acc[sprint] = sprintsAgrupados[sprint];
            return acc;
        }, {});
    }

    function loadTareasSprintsAndUsuarios() {
        setLoading(true);
        Promise.all([
            fetch(API_LIST).then(response => response.json()),
            fetch('/sprints').then(response => response.json()),
            fetch('/usuarios').then(response => response.json())
        ])
        .then(([tareasData, sprintsData, usuariosData]) => {
            const tareasWithDetails = tareasData.map(tarea => ({
                ...tarea,
                nombreSprint: sprintsData.find(sprint => sprint.id === tarea.idsprint)?.nombreSprint || 'Sprint desconocido',
                nombreUsuario: usuariosData.find(usuario => usuario.idUsuario === tarea.idusuario)?.username || 'Usuario desconocido'
            }));
            setTareas(tareasWithDetails);
            setSprints(sprintsData);
            setUsuarios(usuariosData);
            setLoading(false);
        })
        .catch((error) => {
            setLoading(false);
            setError(error.toString());
        });
    }

    function deleteTarea(id) {
        fetch(`${API_LIST}/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                const remainingTareas = tareas.filter(tarea => tarea.idtarea !== id);
                setTareas(remainingTareas);
            } else {
                throw new Error('Error al eliminar la tarea');
            }
        })
        .catch((error) => {
            setError(error.toString());
        });
    }

    function toggleEstado(id, descripcion, estado) {
        const currentTarea = tareas.find(t => t.idtarea === id);
        if (!currentTarea) {
            setError('Tarea no encontrada');
            return;
        }

        const updatedTarea = {
            ...currentTarea,
            descripcionTarea: descripcion,
            estadoTarea: !estado
        };
        
        fetch(`${API_LIST}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTarea)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(`Error al actualizar la tarea: ${text}`);
                });
            }
        })
        .then(updatedTarea => {
            const updatedTareas = tareas.map(tarea => 
                tarea.idtarea === id ? {...updatedTarea, nombreSprint: tarea.nombreSprint, nombreUsuario: tarea.nombreUsuario} : tarea
            );
            setTareas(updatedTareas);
        })
        .catch((error) => {
            console.error('Error:', error);
            setError(error.toString());
        });
    }

    function addTarea(newTarea) {
        setInserting(true);
        const tareaToAdd = {
            ...newTarea,
            estadoTarea: false,
            fechaAsignacion: new Date().toISOString(),
        };

        fetch(API_LIST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tareaToAdd),
        }).then((response) => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Error al añadir la tarea');
            }
        }).then(() => {
            loadTareasSprintsAndUsuarios(); 
            setInserting(false);
            setOpenNewItemDialog(false);
        }).catch((error) => {
            setInserting(false);
            setError(error.toString());
        });
    }

    function startEditTarea(id, currentDescription, currentHours) {
        setEditingId(id);
        setNewDescription(currentDescription);
        setNewHours(currentHours);
    }

    function saveEditTarea(id) {
        const currentTarea = tareas.find(t => t.idtarea === id);
        if (!currentTarea) {
            setError('Tarea no encontrada');
            return;
        }

        const updatedTarea = {
            ...currentTarea,
            descripcionTarea: newDescription,
            horas: newHours,
        };

        fetch(`${API_LIST}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTarea)
        })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(`Error al guardar la tarea: ${text}`);
                });
            }
        })
        .then(updatedTarea => {
            const updatedTareas = tareas.map(tarea => 
                tarea.idtarea === id ? {...updatedTarea, nombreSprint: tarea.nombreSprint, nombreUsuario: tarea.nombreUsuario} : tarea
            );
            setTareas(updatedTareas);
            setEditingId(null);
            setNewDescription('');
            setNewHours('');
        })
        .catch((error) => {
            console.error('Error:', error);
            setError(error.toString());
        });
    }

    return (
        <div className="App">
            <h1>MY TODO LIST</h1>
            <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenNewItemDialog(true)}
                style={{ marginBottom: '20px' }}
                startIcon={<AddTaskIcon />}
            >
                Agregar tarea
            </Button>
            <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                style={{ marginBottom: '20px', marginLeft: '10px' }}
            >
                Logout
            </Button>
            <Dialog open={openNewItemDialog} onClose={() => setOpenNewItemDialog(false)}>
                <DialogTitle>Agregar Nueva Tarea</DialogTitle>
                <DialogContent>
                    <NewItem addItem={addTarea} isInserting={isInserting} sprints={sprints} usuarios={usuarios} />
                </DialogContent>
            </Dialog>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {isLoading && <CircularProgress />}
            {!isLoading && (
                <div id="maincontent">
                    <h2>Tareas Pendientes</h2>
                    {Object.entries(agruparPorSprint()).map(([nombreSprint, tareasDelSprint]) => (
                        tareasDelSprint.pendientes.length > 0 && (
                            <div key={nombreSprint}>
                                <h3>{nombreSprint}</h3>
                                {tareasDelSprint.pendientes.map(tarea => (
                                    <Accordion key={tarea.idtarea} sx={{ backgroundColor: '#303030'}}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                            aria-controls={`panel${tarea.idtarea}-content`}
                                            id={`panel${tarea.idtarea}-header`}
                                        >
                                            <AssignmentIcon sx={{ color: '#FFA726', marginRight: 1 }} />
                                            {editingId === tarea.idtarea ? (
                                                <TextField 
                                                    value={newDescription}
                                                    onChange={(e) => setNewDescription(e.target.value)}
                                                    label="Descripción"
                                                    fullWidth
                                                    InputLabelProps={{ style: { color: 'white' } }}
                                                    inputProps={{ style: { color: 'white' } }}
                                                />
                                            ) : (
                                                <Typography sx={{ color: 'white' }}>{tarea.descripcionTarea}</Typography>
                                            )}
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography sx={{ color: 'white' }}>
                                                Asignado el: <Moment format="MMM Do hh:mm:ss">{tarea.fechaAsignacion}</Moment><br/>
                                                Vence el: <Moment format="MMM Do hh:mm:ss">{tarea.fechaVencimiento}</Moment><br/>
                                                Sprint: {tarea.nombreSprint}<br/>
                                                Usuario: {tarea.nombreUsuario}<br/>
                                            </Typography>
                                            {editingId === tarea.idtarea ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <TextField
                                                        value={newHours}
                                                        onChange={(e) => setNewHours(e.target.value)}
                                                        InputLabelProps={{ style: { color: 'white' } }}
                                                        inputProps={{ style: { color: 'white' } }}
                                                        type="number"
                                                        sx={{ width: '70px', marginTop: 2, marginBottom: 2 }}
                                                    />
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => saveEditTarea(tarea.idtarea)}
                                                        size="small"
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Typography sx={{ color: 'white' }}>Horas: {tarea.horas}</Typography>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => startEditTarea(tarea.idtarea, tarea.descripcionTarea, tarea.horas)}
                                                        size="small"
                                                        sx={{ marginRight: 1, marginTop: 1 }}
                                                    >
                                                        Modify
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => toggleEstado(tarea.idtarea, tarea.descripcionTarea, tarea.estadoTarea)}
                                                        size="small"
                                                        sx={{ marginLeft: 1, marginTop: 1 }}
                                                    >
                                                        Done
                                                    </Button>
                                                    <Button
                                                        startIcon={<DeleteIcon />}
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => deleteTarea(tarea.idtarea)}
                                                        size="small"
                                                        sx={{ marginLeft: 1, marginTop: 1 }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </div>
                        )
                    ))}

                    <h2 style={{ marginTop: '30px' }}>Tareas Completadas</h2>
                    {Object.entries(agruparPorSprint()).map(([nombreSprint, tareasDelSprint]) => (
                        tareasDelSprint.completadas.length > 0 && (
                            <div key={nombreSprint}>
                                <h3>{nombreSprint}</h3>
                                {tareasDelSprint.completadas.map(tarea => (
                                    <Accordion key={tarea.idtarea} sx={{ backgroundColor: '#303030' }}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                                            aria-controls={`panel${tarea.idtarea}-content`}
                                            id={`panel${tarea.idtarea}-header`}
                                        >
                                            <TaskIcon sx={{ color: '#66BB6A', marginRight: 1 }} />
                                            <Typography sx={{ color: 'white' }}>{tarea.descripcionTarea}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Typography sx={{ color: 'white' }}>
                                                Asignado el: <Moment format="MMM Do hh:mm:ss">{tarea.fechaAsignacion}</Moment><br/>
                                                Vence el: <Moment format="MMM Do hh:mm:ss">{tarea.fechaVencimiento}</Moment><br/>
                                                Sprint: {tarea.nombreSprint}<br/>
                                                Usuario: {tarea.nombreUsuario}<br/>
                                                Horas: {tarea.horas}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => toggleEstado(tarea.idtarea, tarea.descripcionTarea, tarea.estadoTarea)}
                                                size="small"
                                            >
                                                Undo
                                            </Button>
                                            <Button
                                                startIcon={<DeleteIcon />}
                                                variant="contained"
                                                color="error"
                                                onClick={() => deleteTarea(tarea.idtarea)}
                                                size="small"
                                            >
                                                Delete
                                            </Button>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
