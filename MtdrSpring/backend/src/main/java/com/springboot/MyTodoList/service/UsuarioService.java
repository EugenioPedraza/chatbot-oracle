package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Servicio para encontar todos los usuarios
    public List<Usuario> findAll() {
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
        return usuarioRepository.save(usuario);
    }

    // Borrar a un usuario
    public boolean deleteUsuario(int id) {
        try {
            usuarioRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Actualizar a un usuario
    public Usuario updateUsuario(int id, Usuario usuario) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        if (usuarioData.isPresent()) {
            Usuario usuario = usuarioData.get();
            usuario.setUsername(usuario.getUsername());
            usuario.setFullName(usuario.getFullName());
            usuario.setRole(usuario.getRole());
            return usuarioRepository.save(usuario);
        } else {
            return null;
        }
    }

    

    
}
