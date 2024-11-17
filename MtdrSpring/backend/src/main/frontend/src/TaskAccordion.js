import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, TextField, Button, FormControl, Select, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskIcon from '@mui/icons-material/Task';
import DeleteIcon from '@mui/icons-material/Delete';
import Moment from 'react-moment';

function TaskAccordion({ tarea, usuarios, editingId, newPoints, newUser, newHours, newAssignedDate, newExpirationDate, newStartDate, newEndDate, setNewPoints, setNewUser, setNewHours, setNewAssignedDate, setNewExpirationDate, setNewStartDate, setNewEndDate, startEditTarea, saveEditTarea, setEditingId, toggleEstado, deleteTarea, isCompleted, markAsStarted, markAsCompleted, markAsUncompleted }) {
    console.log('Rendering TaskAccordion:', tarea.descripcionTarea, 'isCompleted:', isCompleted, 'fechaInicio:', tarea.fechaInicio, 'fechaFin:', tarea.fechaFin);

    const warnings = [];
    if (isCompleted && (!tarea.fechaInicio || !tarea.fechaFin)) {
        if (!tarea.fechaInicio) warnings.push('Marcado como completado pero sin fecha de inicio');
        if (!tarea.fechaFin) warnings.push('Marcado como completado pero sin fecha de fin');
    }
    if (tarea.fechaVencimiento && tarea.fechaAsignacion && new Date(tarea.fechaVencimiento) < new Date(tarea.fechaAsignacion)) {
        warnings.push('Fecha de vencimiento antes de la fecha de asignación');
    }
    if (tarea.fechaFin && tarea.fechaInicio && new Date(tarea.fechaFin) < new Date(tarea.fechaInicio)) {
        warnings.push('Fecha de fin antes de la fecha de inicio');
    }
    if (tarea.fechaFin && tarea.fechaFin > tarea.sprintEndDate) {
        warnings.push('Fecha de fin después de la fecha de fin del sprint');
    }
    if (tarea.fechaInicio && tarea.fechaInicio < tarea.sprintStartDate) {
        warnings.push('Fecha de inicio antes de la fecha de inicio del sprint');
    }
    if (tarea.fechaAsignacion === null || tarea.fechaVencimiento === null || tarea.idusuario === null || tarea.puntos === null || tarea.horas === null) {
        warnings.push('Campos obligatorios faltantes');
    }

    return (
        <Accordion key={tarea.idtarea} sx={{ backgroundColor: isCompleted ? '#303030' : '#303030' }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                aria-controls={`panel${tarea.idtarea}-content`}
                id={`panel${tarea.idtarea}-header`}
            >
                {isCompleted ? <TaskIcon sx={{ color: '#66BB6A', marginRight: 1 }} /> : <AssignmentIcon sx={{ color: '#FFA726', marginRight: 1 }} />}
                <Typography sx={{ color: 'white', position: 'relative' }}>
                    {tarea.descripcionTarea}
                    {warnings.length > 0 && (
                        <span className="tooltip-trigger" style={{ color: 'red', fontWeight: 'bold', marginLeft: '10px', cursor: 'pointer' }}>
                            !
                            <div className="tooltip">
                                <ul style={{ margin: 0, padding: '5px', listStyleType: 'disc', fontSize: '12px', fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                                    {warnings.map((warning, index) => (
                                        <li key={index}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </span>
                    )}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
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
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
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
                                            borderColor: 'white',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'white',
                                        },
                                        '& .MuiSelect-icon': {
                                            color: 'white',
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
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Fecha Asignación:</Typography>
                            <TextField
                                value={newAssignedDate}
                                onChange={(e) => setNewAssignedDate(e.target.value)}
                                type="date"
                                InputLabelProps={{ style: { color: 'white' } }}
                                inputProps={{ style: { color: 'white' } }}
                                sx={{
                                    width: '200px',
                                    marginTop: 2,
                                    marginBottom: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Fecha Vencimiento:</Typography>
                            <TextField
                                value={newExpirationDate}
                                onChange={(e) => setNewExpirationDate(e.target.value)}
                                type="date"
                                InputLabelProps={{ style: { color: 'white' } }}
                                inputProps={{ style: { color: 'white' } }}
                                sx={{
                                    width: '200px',
                                    marginTop: 2,
                                    marginBottom: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Fecha Inicio:</Typography>
                            <TextField
                                value={newStartDate}
                                onChange={(e) => setNewStartDate(e.target.value)}
                                type="date"
                                InputLabelProps={{ style: { color: 'white' } }}
                                inputProps={{ style: { color: 'white' } }}
                                sx={{
                                    width: '200px',
                                    marginTop: 2,
                                    marginBottom: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ color: 'white', marginRight: '5px' }}>Fecha Fin:</Typography>
                            <TextField
                                value={newEndDate}
                                onChange={(e) => setNewEndDate(e.target.value)}
                                type="date"
                                InputLabelProps={{ style: { color: 'white' } }}
                                inputProps={{ style: { color: 'white' } }}
                                sx={{
                                    width: '200px',
                                    marginTop: 2,
                                    marginBottom: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'white',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'white',
                                        },
                                    },
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="contained"
                                onClick={() => saveEditTarea(tarea.idtarea)}
                                size="small"
                            >
                                Save
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setEditingId(null)}
                                size="small"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <Typography sx={{ color: 'white' }}>
                            Asignado el: <Moment format="MMM Do HH:mm:ss">{tarea.fechaAsignacion}</Moment><br/>
                            Vence el: <Moment format="MMM Do HH:mm:ss">{tarea.fechaVencimiento}</Moment><br/>
                            Sprint: {tarea.nombreSprint}<br/>
                            Puntos: {tarea.puntos}<br/>
                            Usuario: {tarea.nombreUsuario}<br/>
                            Horas: {tarea.horas}<br/>
                            Fecha Inicio: {tarea.fechaInicio ? <Moment format="MMM Do HH:mm:ss">{tarea.fechaInicio}</Moment> : 'N/A'}<br/>
                            Fecha Fin: {tarea.fechaFin ? <Moment format="MMM Do HH:mm:ss">{tarea.fechaFin}</Moment> : 'N/A'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => startEditTarea(tarea.idtarea, tarea.descripcionTarea, tarea.horas, tarea.idusuario, tarea.puntos, tarea.fechaAsignacion, tarea.fechaVencimiento, tarea.fechaInicio, tarea.fechaFin)}
                            size="small"
                            sx={{ marginRight: 1, marginTop: 1 }}
                        >
                            Modify
                        </Button>
                        {isCompleted ? (
                            <Button
                                variant="contained"
                                onClick={() => markAsUncompleted(tarea.idtarea)}
                                size="small"
                                sx={{ marginTop: 1 }}
                            >
                                Undo
                            </Button>
                        ) : (
                            tarea.fechaInicio ? (
                                <Button
                                    variant="contained"
                                    onClick={() => markAsCompleted(tarea.idtarea)}
                                    size="small"
                                    sx={{ marginTop: 1 }}
                                >
                                    Done
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={() => markAsStarted(tarea.idtarea)}
                                    size="small"
                                    sx={{ marginTop: 1 }}
                                >
                                    Start
                                </Button>
                            )
                        )}
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
    );
}

export default TaskAccordion;