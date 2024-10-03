import React, { useState } from "react";
import { Button, TextField, Paper, Typography, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

function NewItem({ addItem, isInserting, sprints }) {
    const [newTarea, setNewTarea] = useState({
        descripcionTarea: '',
        fechaVencimiento: '',
        horaVencimiento: '',
        puntos: 0,
        idsprint: '',
        idusuario: 1
    });

    function handleSubmit(e) {
        e.preventDefault();

        // Validación de la descripción
        if (!newTarea.descripcionTarea.trim()) {
            alert("La descripción de la tarea es obligatoria");
            return; // No permitir envío si la descripción está vacía
        }

        // Validación de "Puntos"
        if (newTarea.puntos < 0) {
            alert("Los puntos deben ser un valor mayor o igual a 0");
            return; // No permitir envío si los puntos son menores que 0
        }

        // Validación de la fecha de vencimiento
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0); // Ajustar la hora a 00:00:00 para comparar solo fechas

        const fechaVencimiento = new Date(newTarea.fechaVencimiento);

        // Verificar si la fecha de vencimiento es anterior a la fecha actual
        if (fechaVencimiento < fechaActual) {
            alert("La fecha de vencimiento debe ser posterior a la fecha actual");
            return; // No permitir envío si la fecha es anterior a la actual
        }

        const fechaVencimientoCompleta = `${newTarea.fechaVencimiento}T${newTarea.horaVencimiento}:00`;
        const tareaToSubmit = {
            ...newTarea,
            fechaVencimiento: fechaVencimientoCompleta
        };

        addItem(tareaToSubmit);
        setNewTarea({
            descripcionTarea: '',
            fechaVencimiento: '',
            horaVencimiento: '',
            puntos: 0,
            idsprint: '',
            idusuario: 1
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
            <Typography variant="h5" gutterBottom>
                Agregar Nueva Tarea
            </Typography>
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
                    label="Puntos"
                    type="number"
                    value={newTarea.puntos}
                    onChange={handleChange}
                    margin="normal"
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel id="sprint-select-label">Sprint</InputLabel>
                    <Select
                        labelId="sprint-select-label"
                        id="sprint-select"
                        name="idsprint"
                        value={newTarea.idsprint}
                        label="Sprint"
                        onChange={handleChange}
                    >
                        {sprints.map((sprint) => (
                            <MenuItem key={sprint.id} value={sprint.id}>
                                {sprint.nombreSprint}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    name="idusuario"
                    label="ID Usuario"
                    type="number"
                    value={newTarea.idusuario}
                    onChange={handleChange}
                    margin="normal"
                />
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
