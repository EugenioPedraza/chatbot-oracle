package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;


    // Get all usuarios
    @GetMapping(value = "/usuarios")
    public List<Usuario> getAllUsuarios(){
        return usuarioService.getAllUsuarios();
    }

    // Get usuario by id
    @GetMapping(value = "/usuarios/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id){
        try{
            ResponseEntity<Usuario> responseEntity = usuarioService.getUsuarioById(id);
            return new ResponseEntity<Usuario>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Add usuario
    @PostMapping(value = "/usuarios")
    public ResponseEntity addUsuario(@RequestBody Usuario usuario) throws Exception {
        Usuario us = usuarioService.addUsuario(usuario);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location", "" + us.getIdUsuario());
        System.out.println(us.toString());
        responseHeaders.set("Access-Control-Expose-Headers", "location");
        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    // Update usuario
    @PutMapping(value = "/usuarios/{id}")
    public ResponseEntity updateUsuario(@RequestBody Usuario usuario, @PathVariable int id){
        try{
            Usuario usuario1 = usuarioService.updateUsuario(id, usuario);
            System.out.println(usuario1.toString());
            return new ResponseEntity<>(usuario1,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // Delete usuario
    @DeleteMapping(value = "/usuarios/{id}")
    public ResponseEntity<Boolean> deleteUsuario(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = usuarioService.deleteUsuario(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag, HttpStatus.NOT_FOUND);
        }
    }

}
