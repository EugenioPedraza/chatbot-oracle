package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.SprintUsuario;
import com.springboot.MyTodoList.repository.SprintUsuarioRepository;

@Service
public class SprintUsuarioService {
    @Autowired
    private SprintUsuarioRepository sprintUsuarioRepository;

    public List<SprintUsuario> findAll() {
        List<SprintUsuario> sprintUsuarios = sprintUsuarioRepository.findAll();
        return sprintUsuarios;
    }

    public ResponseEntity<SprintUsuario> getSprintUsuarioById(int id) {
        Optional<SprintUsuario> sprintUsuarioData = sprintUsuarioRepository.findById(id);
        if (sprintUsuarioData.isPresent()) {
            return new ResponseEntity<>(sprintUsuarioData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    public SprintUsuario addSprintUsuario(SprintUsuario sprintUsuario) {
        return sprintUsuarioRepository.save(sprintUsuario);
    }

    public boolean deleteSprintUsuario(int id) {
        try {
            sprintUsuarioRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public SprintUsuario updateSprintUsuario(int id, SprintUsuario sprintUsuario) {
        Optional<SprintUsuario> sprintUsuarioData = sprintUsuarioRepository.findById(id);
        if (sprintUsuarioData.isPresent()) {
            SprintUsuario sprintUsuario2 = sprintUsuarioData.get();
            sprintUsuario2.setIDSPRINT(sprintUsuario.getIDSPRINT());
            sprintUsuario2.setIDUSUARIO(sprintUsuario.getIDUSUARIO());
            return sprintUsuarioRepository.save(sprintUsuario2);
        } else {
            return null;
        }
    }
}
