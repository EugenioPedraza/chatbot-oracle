package com.springboot.MyTodoList.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.MyUserDetails;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.UsuarioRepository;

// https://www.youtube.com/watch?v=TNt3GHuayXs

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired 
    UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Usuario> user = usuarioRepository.findByUsername(username);
        user.orElseThrow(() -> new UsernameNotFoundException("Not found: " + username));
        
        // This should work now because `Usuario` implements `UserDetails`
        return user.map(MyUserDetails::new).get();
    }
    
}
