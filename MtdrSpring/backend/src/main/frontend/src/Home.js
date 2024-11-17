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
//router stuff
// In your Home.js, add this to import:
import { useNavigate } from 'react-router-dom';
import TaskAccordion from './TaskAccordion';

// Componente principal de la aplicación
function Home() {
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
    const [newAssignedDate, setNewAssignedDate] = useState('');
    const [newExpirationDate, setNewExpirationDate] = useState('');
    const [newStartDate, setNewStartDate] = useState('');
    const [newEndDate, setNewEndDate] = useState('');


    // Inside your Home component:
    const navigate = useNavigate();

    // Helper function to set date at 00:00
    function setDateAtStartOfDay(date) {
        if (!date) return null;
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        return d.toISOString();
    }

    // Helper function to set date at 23:59
    function setDateAtEndOfDay(date) {
        if (!date) return null;
        const d = new Date(date);
        d.setUTCHours(23, 59, 59, 999);
        return d.toISOString();
    }

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
            console.log('Response:', response);
            if (response.ok){
                window.location.href = '/logout';
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
                acc[sprint] = { pendientes: [], enProgreso: [], completadas: [] }; // Inicializa el objeto con arrays de pendientes, en progreso y completadas
            }
            if (tarea.estadoTarea) {
                acc[sprint].completadas.push(tarea); // Añade a completadas si la tarea está completada
            } else if (tarea.fechaInicio) {
                acc[sprint].enProgreso.push(tarea); // Añade a en progreso si la tarea tiene fecha de inicio
            } else {
                acc[sprint].pendientes.push(tarea); // Añade a pendientes si la tarea no está completada y no tiene fecha de inicio
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
    function startEditTarea(id, currentDescription, currentHours, currentUser, currentPoints, currentAssignedDate, currentExpirationDate, currentStartDate, currentEndDate) {
        setEditingId(id); // Establece el ID de la tarea que se está editando
        setNewDescription(currentDescription); // Establece la nueva descripción temporalmente
        setNewHours(currentHours); // Establece las nuevas horas temporalmente
        setNewUser(currentUser);
        setNewPoints(currentPoints);
        setNewAssignedDate(currentAssignedDate.split('T')[0]); // Set the date without time
        setNewExpirationDate(currentExpirationDate.split('T')[0]); // Set the date without time
        setNewStartDate(currentStartDate ? currentStartDate.split('T')[0] : '');
        setNewEndDate(currentEndDate ? currentEndDate.split('T')[0] : '');
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
            fechaAsignacion: setDateAtStartOfDay(newAssignedDate),
            fechaVencimiento: setDateAtEndOfDay(newExpirationDate),
            fechaInicio: setDateAtStartOfDay(newStartDate),
            fechaFin: setDateAtEndOfDay(newEndDate),
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
            setNewAssignedDate('');
            setNewExpirationDate('');
            setNewStartDate('');
            setNewEndDate('');
        })
        .catch((error) => {
            console.error('Error:', error);
            setError(error.toString());
        });
    }

    // Function to mark a task as started
    function markAsStarted(id) {
        const currentTarea = tareas.find(t => t.idtarea === id);
        if (!currentTarea) {
            setError('Tarea no encontrada');
            return;
        }

        const updatedTarea = {
            ...currentTarea,
            fechaInicio: new Date().toISOString()
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

    // Function to mark a task as completed
    function markAsCompleted(id) {
        const currentTarea = tareas.find(t => t.idtarea === id);
        if (!currentTarea) {
            setError('Tarea no encontrada');
            return;
        }

        const updatedTarea = {
            ...currentTarea,
            estadoTarea: true,
            fechaFin: new Date().toISOString()
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

    // Function to mark a task as uncompleted
    function markAsUncompleted(id) {
        const currentTarea = tareas.find(t => t.idtarea === id);
        if (!currentTarea) {
            setError('Tarea no encontrada');
            return;
        }

        const updatedTarea = {
            ...currentTarea,
            estadoTarea: false,
            fechaFin: null
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
                color="primary"
                onClick={() => navigate('/stats')}
                style={{ marginBottom: '20px', marginLeft: '10px' }}
            >
                Estadísticas
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
                                    <TaskAccordion
                                        key={tarea.idtarea}
                                        tarea={tarea}
                                        usuarios={usuarios}
                                        editingId={editingId}
                                        newDescription={newDescription}
                                        newPoints={newPoints}
                                        newUser={newUser}
                                        newHours={newHours}
                                        newAssignedDate={newAssignedDate}
                                        newExpirationDate={newExpirationDate}
                                        newStartDate={newStartDate}
                                        newEndDate={newEndDate}
                                        setNewDescription={setNewDescription}
                                        setNewPoints={setNewPoints}
                                        setNewUser={setNewUser}
                                        setNewHours={setNewHours}
                                        setNewAssignedDate={setNewAssignedDate}
                                        setNewExpirationDate={setNewExpirationDate}
                                        setNewStartDate={setNewStartDate}
                                        setNewEndDate={setNewEndDate}
                                        startEditTarea={startEditTarea}
                                        saveEditTarea={saveEditTarea}
                                        setEditingId={setEditingId}
                                        toggleEstado={toggleEstado}
                                        deleteTarea={deleteTarea}
                                        isCompleted={false}
                                        markAsStarted={markAsStarted}
                                        markAsCompleted={markAsCompleted}
                                        markAsUncompleted={markAsUncompleted}
                                    />
                                ))}
                            </div>
                        )
                    ))}
    
                    <h2 style={{ marginTop: '30px' }}>Tareas En Progreso</h2>
                    {Object.entries(agruparPorSprint()).some(([_, tareasDelSprint]) => tareasDelSprint.enProgreso.length > 0) ? (
                        Object.entries(agruparPorSprint()).map(([nombreSprint, tareasDelSprint]) => (
                            tareasDelSprint.enProgreso.length > 0 && (
                                <div key={nombreSprint}>
                                    <h3>{nombreSprint}</h3>
                                    {tareasDelSprint.enProgreso.map(tarea => (
                                        <TaskAccordion
                                            key={tarea.idtarea}
                                            tarea={tarea}
                                            usuarios={usuarios}
                                            editingId={editingId}
                                            newDescription={newDescription}
                                            newPoints={newPoints}
                                            newUser={newUser}
                                            newHours={newHours}
                                            newAssignedDate={newAssignedDate}
                                            newExpirationDate={newExpirationDate}
                                            newStartDate={newStartDate}
                                            newEndDate={newEndDate}
                                            setNewDescription={setNewDescription}
                                            setNewPoints={setNewPoints}
                                            setNewUser={setNewUser}
                                            setNewHours={setNewHours}
                                            setNewAssignedDate={setNewAssignedDate}
                                            setNewExpirationDate={setNewExpirationDate}
                                            setNewStartDate={setNewStartDate}
                                            setNewEndDate={setNewEndDate}
                                            startEditTarea={startEditTarea}
                                            saveEditTarea={saveEditTarea}
                                            setEditingId={setEditingId}
                                            toggleEstado={toggleEstado}
                                            deleteTarea={deleteTarea}
                                            isCompleted={false}
                                            markAsStarted={markAsStarted}
                                            markAsCompleted={markAsCompleted}
                                            markAsUncompleted={markAsUncompleted}
                                        />
                                    ))}
                                </div>
                            )
                        ))
                    ) : (
                        <Typography sx={{ color: 'white' }}>No hay tareas en progreso</Typography>
                    )}
                    <h2 style={{ marginTop: '30px' }}>Tareas Completadas</h2>
                    {Object.entries(agruparPorSprint()).map(([nombreSprint, tareasDelSprint]) => (
                        tareasDelSprint.completadas.length > 0 && (
                            <div key={nombreSprint}>
                                <h3>{nombreSprint}</h3>
                                {tareasDelSprint.completadas.map(tarea => (
                                    <TaskAccordion
                                        key={tarea.idtarea}
                                        tarea={tarea}
                                        usuarios={usuarios}
                                        editingId={editingId}
                                        newDescription={newDescription}
                                        newPoints={newPoints}
                                        newUser={newUser}
                                        newHours={newHours}
                                        newAssignedDate={newAssignedDate}
                                        newExpirationDate={newExpirationDate}
                                        newStartDate={newStartDate}
                                        newEndDate={newEndDate}
                                        setNewDescription={setNewDescription}
                                        setNewPoints={setNewPoints}
                                        setNewUser={setNewUser}
                                        setNewHours={setNewHours}
                                        setNewAssignedDate={setNewAssignedDate}
                                        setNewExpirationDate={setNewExpirationDate}
                                        setNewStartDate={setNewStartDate}
                                        setNewEndDate={setNewEndDate}
                                        startEditTarea={startEditTarea}
                                        saveEditTarea={saveEditTarea}
                                        setEditingId={setEditingId}
                                        toggleEstado={toggleEstado}
                                        deleteTarea={deleteTarea}
                                        isCompleted={true}
                                        markAsStarted={markAsStarted}
                                        markAsCompleted={markAsCompleted}
                                        markAsUncompleted={markAsUncompleted}
                                    />
                                ))}
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;


