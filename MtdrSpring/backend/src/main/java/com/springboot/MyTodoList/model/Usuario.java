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
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    int IDUsuario;
    @Column (name = "NOMBREUSUARIO")
    String username;
    @Column (name = "NOMBRECOMPLETO")
    String fullName;
    @Column (name = "ROLEUSUARIO")
    String role;
    @Column (name = "IS_ADMIN")
    boolean isAdmin;
    @Column (name = "TELEGRAMID")
    int telegramID;

    public Usuario() {
        isAdmin = false;
    }

    public Usuario(int IDUsuario, String username, String fullName, String role, boolean isAdmin) {
        this.IDUsuario = IDUsuario;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.isAdmin = isAdmin;
    }

    public int getID() {
        return IDUsuario;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public boolean getIsAdmin() {
        return isAdmin;
    }

    public int getTelegramID() {
        return telegramID;
    }

    public void setID(int ID) {
        this.IDUsuario = ID;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setIsAdmin(boolean isAdmin) {
         this.isAdmin = isAdmin;
    }

    public void setTelegramID(int telegramID) {
        this.telegramID = telegramID;
    }

    @Override
    public String toString() {
        return "Usario{" +
                "IDUsuario=" + IDUsuario +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", role='" + role + '\'' +
                ", isAdmin=" + isAdmin +
                ", telegramID=" + telegramID +
                '}';
    }

}
