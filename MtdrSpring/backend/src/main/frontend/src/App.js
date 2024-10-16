// Importando los módulos y componentes necesarios de React y Material-UI
import React, { useState, useEffect } from 'react';
import NewItem from './NewItem'; // Importando el componente NewItem
import API_LIST from './API'; // Importando el endpoint de la API
import DeleteIcon from '@mui/icons-material/Delete'; // Importando iconos de Material-UI
import { Button, CircularProgress, Dialog, DialogTitle, DialogContent, Accordion, AccordionSummary, AccordionDetails, Typography, TextField } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TaskIcon from '@mui/icons-material/Task';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddTaskIcon from '@mui/icons-material/AddTask';
import Moment from 'react-moment'; // Importando librería para manejo de fechas

// Componente principal de la aplicación
function App() {
    // Definición de estados utilizando useState
    const [isLoading, setLoading] = useState(false); // Estado para manejar si está cargando
    const [isInserting, setInserting] = useState(false); // Estado para manejar si se está insertando un elemento
    const [tareas, setTareas] = useState([]); // Estado para almacenar las tareas
    const [sprints, setSprints] = useState([]); // Estado para almacenar los sprints
    const [usuarios, setUsuarios] = useState([]); // Estado para almacenar los usuarios
    const [error, setError] = useState(null); // Estado para almacenar errores
    const [editingId, setEditingId] = useState(null); // Estado para almacenar el ID de la tarea que se está editando
    const [newDescription, setNewDescription] = useState(''); // Estado para la nueva descripción de la tarea
    const [newHours, setNewHours] = useState(''); // Estado para las nuevas horas de la tarea
    const [openNewItemDialog, setOpenNewItemDialog] = useState(false); // Estado para manejar el diálogo de agregar nueva tarea
    const [newUser, setNewUser] = useState('');
    const [newPoints, setNewPoints] = useState('');

    // Función para manejar el cierre de sesión
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
                window.location.href = '/login'; // Redirige al usuario al login si se cierra sesión correctamente
            } else {
                console.error('Error al cerrar sesión');
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    }

    // useEffect para cargar datos al montar el componente
    useEffect(() => {
        loadTareasSprintsAndUsuarios(); // Llama a la función para cargar tareas, sprints y usuarios
    }, []);

    // Función para agrupar tareas por sprint
    function agruparPorSprint() {
        const sprintsAgrupados = tareas.reduce((acc, tarea) => {
            const sprint = tarea.nombreSprint;
            if (!acc[sprint]) {
                acc[sprint] = { pendientes: [], completadas: [] }; // Inicializa el objeto con arrays de pendientes y completadas
            }
            if (tarea.estadoTarea) {
                acc[sprint].completadas.push(tarea); // Añade a completadas si la tarea está completada
            } else {
                acc[sprint].pendientes.push(tarea); // Añade a pendientes si la tarea no está completada
            }
            return acc;
        }, {});
        const sprintsOrdenados = Object.keys(sprintsAgrupados).sort((a, b) => {
            return a.localeCompare(b, undefined, { numeric: true }); // Ordena los sprints alfabéticamente
        });
        return sprintsOrdenados.reduce((acc, sprint) => {
            acc[sprint] = sprintsAgrupados[sprint];
            return acc;
        }, {});
    }

    // Función para cargar tareas, sprints y usuarios desde la API
    function loadTareasSprintsAndUsuarios() {
        setLoading(true); // Establece isLoading a true mientras se cargan los datos
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
            setTareas(tareasWithDetails); // Actualiza el estado de tareas con los detalles añadidos
            setSprints(sprintsData); // Actualiza el estado de sprints
            setUsuarios(usuariosData); // Actualiza el estado de usuarios
            setLoading(false); // Establece isLoading a false ya que la carga ha terminado
        })
        .catch((error) => {
            setLoading(false);
            setError(error.toString()); // Guarda el error en el estado
        });
    }

    // Función para eliminar una tarea
    function deleteTarea(id) {
        fetch(`${API_LIST}/${id}`, {
            method: 'DELETE',
        })
        .then(response => {
            if (response.ok) {
                const remainingTareas = tareas.filter(tarea => tarea.idtarea !== id); // Filtra las tareas restantes
                setTareas(remainingTareas); // Actualiza el estado con las tareas restantes
            } else {
                throw new Error('Error al eliminar la tarea');
            }
        })
        .catch((error) => {
            setError(error.toString()); // Guarda el error en el estado
        });
    }

    // Función para cambiar el estado de una tarea
    function toggleEstado(id, descripcion, estado) {
        const currentTarea = tareas.find(t => t.idtarea === id);
        if (!currentTarea) {
            setError('Tarea no encontrada');
            return;
        }

        const updatedTarea = {
            ...currentTarea,
            descripcionTarea: descripcion,
            estadoTarea: !estado // Cambia el estado de la tarea
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
            setTareas(updatedTareas); // Actualiza el estado de tareas con la tarea actualizada
        })
        .catch((error) => {
            console.error('Error:', error);
            setError(error.toString());
        });
    }

    // Función para añadir una nueva tarea
    function addTarea(newTarea) {
        setInserting(true); // Establece isInserting a true mientras se inserta
        const tareaToAdd = {
            ...newTarea,
            estadoTarea: false,
            fechaAsignacion: new Date().toISOString(), // Establece la fecha de asignación a la actual
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
            loadTareasSprintsAndUsuarios(); // Recarga las tareas después de añadir una nueva
            setInserting(false); // Establece isInserting a false ya que la inserción ha terminado
            setOpenNewItemDialog(false); // Cierra el diálogo de nueva tarea
        }).catch((error) => {
            setInserting(false);
            setError(error.toString()); // Guarda el error en el estado
        });
    }

    // Función para iniciar la edición de una tarea
    function startEditTarea(id, currentDescription, currentHours, currentUser, currentPoints) {
        setEditingId(id); // Establece el ID de la tarea que se está editando
        setNewDescription(currentDescription); // Establece la nueva descripción temporalmente
        setNewHours(currentHours); // Establece las nuevas horas temporalmente
        setNewUser(currentUser);
        setNewPoints(currentPoints);
    }

    // Función para guardar los cambios de una tarea editada
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
            idusuario: newUser,
            puntos: newPoints,
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
                tarea.idtarea === id ? {...updatedTarea, nombreSprint: tarea.nombreSprint, nombreUsuario: usuarios.find((u) => u.idUsuario === newUser).username} : tarea
            );
            setTareas(updatedTareas); // Actualiza el estado con la tarea modificada
            setEditingId(null); // Resetea el estado de edición
            setNewDescription(''); // Limpia la descripción temporal
            setNewHours(''); // Limpia las horas temporales
            setNewUser('');
            setNewPoints('');
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
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '& fieldset': {
                                                                borderColor: 'white', // Color del borde
                                                            },
                                                            '&:hover fieldset': {
                                                                borderColor: 'white', // Color del borde al pasar el mouse
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: 'white', // Color del borde al enfocar
                                                            },
                                                        },
                                                    }}
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
                                            </Typography>
                                            {editingId === tarea.idtarea ? (
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Puntos:</Typography>
                                                            <TextField
                                                                value={newPoints}
                                                                onChange={(e) => setNewPoints(e.target.value)}
                                                                InputLabelProps={{ style: { color: 'white' } }}
                                                                inputProps={{ style: { color: 'white' } }}
                                                                type="number"
                                                                sx={{
                                                                    width: '70px',
                                                                    marginTop: 2,
                                                                    marginBottom: 2,
                                                                    '& .MuiOutlinedInput-root': {
                                                                        '& fieldset': {
                                                                            borderColor: 'white', // Color del borde
                                                                        },
                                                                        '&:hover fieldset': {
                                                                            borderColor: 'white', // Color del borde al pasar el mouse
                                                                        },
                                                                        '&.Mui-focused fieldset': {
                                                                            borderColor: 'white', // Color del borde al enfocar
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Usuario:</Typography>
                                                            <FormControl sx={{ minWidth: 300 }}>
                                                                <Select
                                                                    value={newUser}
                                                                    onChange={(e) => setNewUser(e.target.value)}
                                                                    sx={{
                                                                        color: 'white',
                                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: 'white', // Color del borde
                                                                        },
                                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: 'white', // Color del borde al pasar el mouse
                                                                        },
                                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                            borderColor: 'white', // Color del borde al enfocar
                                                                        },
                                                                        '& .MuiSelect-icon': {
                                                                            color: 'white', // Color del icono desplegable
                                                                        },
                                                                    }}
                                                                >
                                                                    {usuarios.map((usuario) => (
                                                                        <MenuItem key={usuario.idUsuario} value={usuario.idUsuario}>
                                                                            {usuario.username}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Horas:</Typography>
                                                            <TextField
                                                                value={newHours}
                                                                onChange={(e) => setNewHours(e.target.value)}
                                                                InputLabelProps={{ style: { color: 'white' } }}
                                                                inputProps={{ style: { color: 'white' } }}
                                                                type="number"
                                                                sx={{
                                                                    width: '70px',
                                                                    marginTop: 2,
                                                                    marginBottom: 2,
                                                                    '& .MuiOutlinedInput-root': {
                                                                        '& fieldset': {
                                                                            borderColor: 'white', // Color del borde
                                                                        },
                                                                        '&:hover fieldset': {
                                                                            borderColor: 'white', // Color del borde al pasar el mouse
                                                                        },
                                                                        '&.Mui-focused fieldset': {
                                                                            borderColor: 'white', // Color del borde al enfocar
                                                                        },
                                                                    },
                                                                }}
                                                            />
                                                        </div>
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
                                                    <Typography sx={{ color: 'white' }}>Puntos: {tarea.puntos}<br/></Typography>
                                                    <Typography sx={{ color: 'white' }}>Usuario: {tarea.nombreUsuario}<br/></Typography>
                                                    <Typography sx={{ color: 'white' }}>Horas: {tarea.horas}</Typography>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => startEditTarea(tarea.idtarea, tarea.descripcionTarea, tarea.horas, tarea.idusuario, tarea.puntos)}
                                                        size="small"
                                                        sx={{ marginRight: 1, marginTop: 1 }}
                                                    >
                                                        Modify
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => toggleEstado(tarea.idtarea, tarea.descripcionTarea, tarea.estadoTarea)}
                                                        size="small"
                                                        sx={{ marginTop: 1 }}
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
                                                Puntos: {tarea.puntos}<br/>
                                                Usuario: {tarea.nombreUsuario}<br/>
                                                Horas: {tarea.horas}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                onClick={() => toggleEstado(tarea.idtarea, tarea.descripcionTarea, tarea.estadoTarea)}
                                                size="small"
                                                sx={{ marginRight: 1, marginTop: 1 }}
                                            >
                                                Undo
                                            </Button>
                                            <Button
                                                startIcon={<DeleteIcon />}
                                                variant="contained"
                                                color="error"
                                                onClick={() => deleteTarea(tarea.idtarea)}
                                                size="small"
                                                sx={{ marginTop: 1 }}
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
