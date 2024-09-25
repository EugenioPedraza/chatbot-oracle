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

  

}
