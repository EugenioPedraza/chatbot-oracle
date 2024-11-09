package com.springboot.MyTodoList.repository;

import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.springboot.MyTodoList.model.Usuario;

@Repository
@Transactional
@EnableTransactionManagement
public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {
    // Aqui se realiza la busqueda del usuario con su username
    Optional<Usuario> findByUsername(String username);
}
