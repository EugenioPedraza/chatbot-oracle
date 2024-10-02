import React, { useState, useEffect } from 'react';
import NewItem from './NewItem';
import API_LIST from './API';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button, TableBody, CircularProgress } from '@mui/material';
import Moment from 'react-moment';

function App() {
    const [isLoading, setLoading] = useState(false);
    const [isInserting, setInserting] = useState(false);
    const [tareas, setTareas] = useState([]);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(API_LIST)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error al cargar las tareas');
                }
            })
            .then(
                (result) => {
                    setLoading(false);
                    setTareas(result);
                },
                (error) => {
                    setLoading(false);
                    setError(error.toString());
                }
            );
    }, []);

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
                tarea.idtarea === id ? updatedTarea : tarea
            );
            setTareas(updatedTareas);
        })
        .catch((error) => {
            console.error('Error:', error);
            setError(error.toString());
        });
    }

    function addTarea(descripcion) {
        setInserting(true);
        const newTarea = {
            descripcionTarea: descripcion,
            estadoTarea: false,
            fechaVencimiento: new Date().toISOString(),
            fechaAsignacion: new Date().toISOString(),
            puntos: 0,
            idsprint: 1,
            idusuario: 1
        };

        fetch(API_LIST, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTarea),
        }).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error al añadir la tarea');
            }
        }).then(
            (result) => {
                setTareas([result, ...tareas]);
                setInserting(false);
            },
            (error) => {
                setInserting(false);
                setError(error.toString());
            }
        );
    }

    function startEditTarea(id, currentDescription) {
        setEditingId(id);
        setNewDescription(currentDescription);
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
                    throw new Error(`Error al guardar la tarea: ${text}`);
                });
            }
        })
        .then(updatedTarea => {
            const updatedTareas = tareas.map(tarea => 
                tarea.idtarea === id ? updatedTarea : tarea
            );
            setTareas(updatedTareas);
            setEditingId(null);
            setNewDescription('');
        })
        .catch((error) => {
            console.error('Error:', error);
            setError(error.toString());
        });
    }

    return (
        <div className="App">
            <h1>MY TODO LIST</h1>
            <NewItem addItem={addTarea} isInserting={isInserting} />
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
            {isLoading && <CircularProgress />}
            {!isLoading && (
                <div id="maincontent">
                    <table id="itemlistNotDone" className="itemlist">
                        <TableBody>
                            {tareas.map(tarea => (
                                !tarea.estadoTarea && (
                                    <tr key={tarea.idtarea}>
                                        <td className="description">
                                            {editingId === tarea.idtarea ? (
                                                <input
                                                    type="text"
                                                    value={newDescription}
                                                    onChange={(e) => setNewDescription(e.target.value)}
                                                />
                                            ) : (
                                                tarea.descripcionTarea
                                            )}
                                        </td>
                                        <td className="date">
                                            <Moment format="MMM Do hh:mm:ss">{tarea.fechaAsignacion}</Moment>
                                        </td>
                                        <td>
                                            {editingId === tarea.idtarea ? (
                                                <Button
                                                    variant="contained"
                                                    onClick={() => saveEditTarea(tarea.idtarea)}
                                                    size="small"
                                                >
                                                    Save
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    onClick={() => startEditTarea(tarea.idtarea, tarea.descripcionTarea)}
                                                    size="small"
                                                >
                                                    Modify
                                                </Button>
                                            )}
                                        </td>
                                        <td>
                                            <Button
                                                variant="contained"
                                                className="DoneButton"
                                                onClick={() => toggleEstado(tarea.idtarea, tarea.descripcionTarea, tarea.estadoTarea)}
                                                size="small"
                                            >
                                                Done
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </TableBody>
                    </table>

                    <h2 id="donelist">Done items</h2>
                    <table id="itemlistDone" className="itemlist">
                        <TableBody>
                            {tareas.map(tarea => (
                                tarea.estadoTarea && (
                                    <tr key={tarea.idtarea}>
                                        <td className="description">{tarea.descripcionTarea}</td>
                                        <td className="date">
                                            <Moment format="MMM Do hh:mm:ss">{tarea.fechaAsignacion}</Moment>
                                        </td>
                                        <td>
                                            <Button
                                                variant="contained"
                                                className="DoneButton"
                                                onClick={() => toggleEstado(tarea.idtarea, tarea.descripcionTarea, tarea.estadoTarea)}
                                                size="small"
                                            >
                                                Undo
                                            </Button>
                                        </td>
                                        <td>
                                            <Button
                                                startIcon={<DeleteIcon />}
                                                variant="contained"
                                                className="DeleteButton"
                                                onClick={() => deleteTarea(tarea.idtarea)}
                                                size="small"
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </TableBody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;