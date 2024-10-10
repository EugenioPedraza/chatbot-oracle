package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Servicio para encontar todos los usuarios
    public List<Usuario> getAllUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarios;
    }

    // Encontrar un usuario por su ID
    public ResponseEntity<Usuario> getUsuarioById(int id) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        if (usuarioData.isPresent()) {
            return new ResponseEntity<>(usuarioData.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Añadir a un usuario
    public Usuario addUsuario(Usuario usuario) {
        try {
            return usuarioRepository.save(usuario);
        } catch (Exception e) {
            logger.error("Error adding usuario: ", e);
            throw e;
        }
    }

    // Borrar a un usuario
    public boolean deleteUsuario(int id) {
        try {
            usuarioRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            logger.error("Error deleting usuario: ", e);
            return false;
        }
    }

    // Actualizar a un usuario
    public Usuario updateUsuario(int id, Usuario usuario) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        if (usuarioData.isPresent()) {
            Usuario usuario2 = usuarioData.get();
            usuario2.setUsername(usuario.getUsername());
            usuario2.setFullName(usuario.getFullName());
            usuario2.setRole(usuario.getRole());
            usuario2.setPhone(usuario.getPhone());
            return usuarioRepository.save(usuario2);
        } else {
            return null;
        }
    }
}