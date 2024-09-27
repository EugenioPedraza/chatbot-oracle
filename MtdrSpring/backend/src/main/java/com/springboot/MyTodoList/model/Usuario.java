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
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    @Column(name = "IDUSUARIO")
    int idUsuario; 

    @Column(name = "NOMBREUSUARIO")
    String username;

    @Column(name = "NOMBRECOMPLETO")
    String fullName;

    @Column(name = "ROLUSUARIO")
    String role;

    @Column(name = "ISADMIN")
    boolean isAdmin;

    @Column(name = "TELEGRAMID")
    String telegramID;

    // Default constructor
    public Usuario() {
        
    }

    // Parameterized constructor
    public Usuario(int idUsuario, String username, String fullName, String role, boolean isAdmin) {
        this.idUsuario = idUsuario;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.isAdmin = isAdmin;
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

    public String getTelegramID() {
        return telegramID;
    }

    public void setTelegramID(String telegramID) {
        this.telegramID = telegramID;
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
                ", telegramID='" + telegramID + '\'' +
                '}';
    }
}