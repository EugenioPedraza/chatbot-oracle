import React, { useState } from "react";
import { Button, TextField, Paper, Typography, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

function NewItem({ addItem, isInserting, sprints, usuarios }) {
    const [newTarea, setNewTarea] = useState({
        descripcionTarea: '',
        fechaVencimiento: '',
        horaVencimiento: '',
        puntos: 0,
        idsprint: '',
        idusuario: '',
        horas: ''
    });

    function handleSubmit(e) {
        e.preventDefault();
        // Asegurarse de que todos los campos obligatorios están completos
        if (!newTarea.descripcionTarea.trim() || !newTarea.idusuario || !newTarea.idsprint) {
            return;
        }

        // Preparar la fecha de vencimiento completa
        const fechaVencimientoCompleta = `${newTarea.fechaVencimiento}T${newTarea.horaVencimiento}:00`;
        const tareaToSubmit = {
            ...newTarea,
            fechaVencimiento: fechaVencimientoCompleta
        };

        // Llamar a la función de agregar tarea
        addItem(tareaToSubmit);

        // Resetear el formulario después de agregar la tarea
        setNewTarea({
            descripcionTarea: '',
            fechaVencimiento: '',
            horaVencimiento: '',
            puntos: 0,
            idsprint: '',
            idusuario: '',
            horas: ''
        });
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setNewTarea(prevTarea => ({
            ...prevTarea,
            [name]: value
        }));
    }

    return (
        <Paper elevation={3} style={{ padding: '20px', maxWidth: '500px', margin: '20px auto' }}>
            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
                <TextField
                    fullWidth
                    name="descripcionTarea"
                    label="Descripción de la tarea"
                    value={newTarea.descripcionTarea}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    name="fechaVencimiento"
                    label="Fecha de vencimiento"
                    type="date"
                    value={newTarea.fechaVencimiento}
                    onChange={handleChange}
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    fullWidth
                    name="horaVencimiento"
                    label="Hora de vencimiento"
                    type="time"
                    value={newTarea.horaVencimiento}
                    onChange={handleChange}
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    fullWidth
                    name="puntos"
                    label="Story Points"
                    type="number"
                    value={newTarea.puntos}
                    onChange={handleChange}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    name="horas"
                    label="Horas"
                    type="number"
                    value={newTarea.horas}
                    onChange={handleChange}
                    margin="normal"
                />
                {/* Selector para Sprints */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="sprint-select-label">Sprint</InputLabel>
                    <Select
                        labelId="sprint-select-label"
                        id="sprint-select"
                        name="idsprint"
                        value={newTarea.idsprint}
                        label="Sprint"
                        onChange={handleChange}
                        required
                    >
                        {sprints.map((sprint) => (
                            <MenuItem key={sprint.id} value={sprint.id}>
                                {sprint.nombreSprint}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {/* Selector para Usuarios */}
                <FormControl fullWidth margin="normal">
                    <InputLabel id="usuario-select-label">Usuario</InputLabel>
                    <Select
                        labelId="usuario-select-label"
                        id="usuario-select"
                        name="idusuario"
                        value={newTarea.idusuario}
                        label="Usuario"
                        onChange={handleChange}
                        required
                    >
                        {usuarios.map((usuario) => (
                            <MenuItem key={usuario.idUsuario} value={usuario.idUsuario}>
                                {usuario.username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box mt={2}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isInserting}
                    >
                        {isInserting ? "Guardando..." : "Agregar Tarea"}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}

export default NewItem;
