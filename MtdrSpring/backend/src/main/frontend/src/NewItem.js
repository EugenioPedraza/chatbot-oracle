import React, { useState } from "react";
import { Button, TextField, Paper, Typography, Box } from '@mui/material';

function NewItem(props) {
  const [newTarea, setNewTarea] = useState({
    descripcionTarea: '',
    fechaVencimiento: '',
    horaVencimiento: '',
    puntos: 0,
    idsprint: 1,
    idusuario: 1
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!newTarea.descripcionTarea.trim()) {
      return;
    }
    const fechaVencimientoCompleta = `${newTarea.fechaVencimiento}T${newTarea.horaVencimiento}:00`;
    const tareaToSubmit = {
      ...newTarea,
      fechaVencimiento: fechaVencimientoCompleta
    };
    props.addItem(tareaToSubmit);
    setNewTarea({
      descripcionTarea: '',
      fechaVencimiento: '',
      horaVencimiento: '',
      puntos: 0,
      idsprint: 1,
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
        <TextField
          fullWidth
          name="idsprint"
          label="ID Sprint"
          type="number"
          value={newTarea.idsprint}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          name="idusuario"
          label="ID Usuario"
          type="number"
          value={newTarea.idusuario}
          onChange={handleChange}
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
          disabled={props.isInserting}
        >
          {props.isInserting ? 'Agregando…' : 'Agregar Tarea'}
        </Button>
      </Box>
    </Paper>
  );
}

export default NewItem;