package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.repository.SprintRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
@Service
public class SprintService {
 
    @Autowired
    private SprintRepository SprintRepository;
    
    public List<Sprint> findAll(){
        List<Sprint> sprints = SprintRepository.findAll();
        return sprints;
    }

    public ResponseEntity<Sprint> getSprintById(int id){
        Optional<Sprint> sprintData = SprintRepository.findById(id);
        if(sprintData.isPresent()){
            return new ResponseEntity<>(sprintData.get(), HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public Sprint addSprint(Sprint sprint){
        return SprintRepository.save(sprint);
    }

    public boolean deleteSprint(int id){
        try{
            SprintRepository.deleteById(id);
            return true;
        }catch(Exception e){
            return false;
        }
    }

    public Sprint updateSprint(int id, Sprint sprint){
        Optional<Sprint> sprintData = SprintRepository.findById(id);
        if(sprintData.isPresent()){
            Sprint sprint = sprintData.get();
            sprint.setID(id);
            sprint.setFechaInicio(sprint.getFechaFin());
            sprint.setFechaFin(sprint.getFechaFin());
            sprint.setEstadoSprint(sprint.getEstadoSprint());
            sprint.setNombreSprint(sprint.getNombreSprint());

            return SprintRepository.save(sprint);
        }else{
            return null;
        }
    }

    
}
