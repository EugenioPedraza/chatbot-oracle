package com.springboot.MyTodoList.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

    public String getUsernameById(int id) {
        Optional<Usuario> usuarioData = usuarioRepository.findById(id);
        return usuarioData.map(Usuario::getUsername).orElse("Usuario desconocido");
    }

    // Añadir a un usuario
    public Usuario addUsuario(Usuario usuario) {
        try {
            // Ensure the password is encoded before saving the user
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            return usuarioRepository.save(usuario);
        } catch (Exception e) {
            // Handle the exception appropriately
            throw new RuntimeException("Error adding usuario", e);
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
        return usuarioRepository.findById(id).map(existingUsuario -> {
            existingUsuario.setUsername(usuario.getUsername());
            existingUsuario.setFullName(usuario.getFullName());
            // existingUsuario.setRole(usuario.getRole());
            existingUsuario.setAdmin(usuario.isAdmin());
            existingUsuario.setPhone(usuario.getPhone());

            // Ensure the password is encoded before updating if the password is not null
            if (usuario.getPassword() != null) {
                existingUsuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            }
            
            return usuarioRepository.save(existingUsuario);
        }).orElseThrow(() -> new RuntimeException("Usuario not found with id " + id));
    }
}
