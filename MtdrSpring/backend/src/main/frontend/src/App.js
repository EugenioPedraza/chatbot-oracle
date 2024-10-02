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
    const [error, setError] = useState();
    const [editingId, setEditingId] = useState(null);
    const [newDescription, setNewDescription] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch(API_LIST)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong ...');
                }
            })
            .then(
                (result) => {
                    setLoading(false);
                    setTareas(result);
                },
                (error) => {
                    setLoading(false);
                    setError(error);
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
                throw new Error('Something went wrong ...');
            }
        })
        .catch((error) => {
            setError(error);
        });
    }

    function toggleEstado(id, descripcion, estado) {
        const updatedTarea = {
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
                throw new Error('Something went wrong ...');
            }
        })
        .then(updatedTarea => {
            const updatedTareas = tareas.map(tarea => 
                tarea.idtarea === id ? updatedTarea : tarea
            );
            setTareas(updatedTareas);
        })
        .catch((error) => {
            setError(error);
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
                throw new Error('Something went wrong ...');
            }
        }).then(
            (result) => {
                setTareas([result, ...tareas]);
                setInserting(false);
            },
            (error) => {
                setInserting(false);
                setError(error);
            }
        );
    }

    function startEditTarea(id, currentDescription) {
        setEditingId(id);
        setNewDescription(currentDescription);
    }

    function saveEditTarea(id) {
        const updatedTarea = {
            descripcionTarea: newDescription,
            estadoTarea: tareas.find(t => t.idtarea === id).estadoTarea
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
                throw new Error('Something went wrong ...');
            }
        })
        .then(updatedTarea => {
            const updatedTareas = tareas.map(tarea => 
                tarea.idtarea === id ? updatedTarea : tarea
            );
            setTareas(updatedTareas);
            setEditingId(null);
        })
        .catch((error) => {
            setError(error);
        });
    }

    return (
        <div className="App">
            <h1>MY TODO LIST</h1>
            <NewItem addItem={addTarea} isInserting={isInserting} />
            {error && <p>Error: {error.message}</p>}
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