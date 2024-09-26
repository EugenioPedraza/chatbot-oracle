package com.springboot.MyTodoList.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.repository.TareaRepository;

@Service
public class TareaService {

    @Autowired
    private TareaRepository tareaRepository;
    
    public List<Tarea> findAll() {
        List<Tarea> tareas = tareaRepository.findAll();
        return tareas;
    }

    public Tarea getTareaById(int id) {
        return tareaRepository.findById(id).get();
    }

    public Tarea addTarea(Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    public Tarea updateTarea(int id, Tarea tarea) {
        Tarea tarea2 = tareaRepository.findById(id).get();
        tarea2.setIDTarea(id);
        tarea2.setDescripcionTarea(tarea.getDescripcionTarea());
        tarea2.setEstadoTarea(tarea.getEstadoTarea());
        tarea2.setFechaAsignacion(tarea.getFechaAsignacion());
        tarea2.setFechaVencimiento(tarea.getFechaVencimiento());
        tarea2.setIDSprint(tarea.getIDSprint());
        tarea2.setIDUsuario(tarea.getIDUsuario());
        return tareaRepository.save(tarea2);
    }

    public boolean deleteTarea(int id) {
        try {
            tareaRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
