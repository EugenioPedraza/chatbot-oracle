package com.springboot.MyTodoList.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "USUARIO")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IDUSUARIO")
    private int idUsuario; 

    @Column(name = "NOMBREUSUARIO", unique = true)
    private String username;

    @Column(name = "NOMBRECOMPLETO")
    private String fullName;

    @Column(name = "ROLUSUARIO")
    private String role;

    @Column(name = "ISADMIN")
    private boolean isAdmin;

    @Column(name = "CONTRASENA", nullable = true)
    private String contrasena;

    @Column(name = "TELEFONO")
    private String phone;

    // Default constructor
    public Usuario() {
        
    }

    // Parameterized constructor
    public Usuario(int idUsuario, String username, String fullName, String role, boolean isAdmin, String phone, String contrasena) {
        this.idUsuario = idUsuario;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.isAdmin = isAdmin;
        this.phone = phone;
        this.contrasena = contrasena;
    }

    // Getters and setters
    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getContrasena() {
        return contrasena;
    }

    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }

    // toString method
    @Override
    public String toString() {
        return "Usuario{" +
                "idUsuario=" + idUsuario +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", role='" + role + '\'' +
                ", isAdmin=" + isAdmin +
                ", contrasena='" + (contrasena != null ? contrasena : "N/A") + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}
