package com.springboot.MyTodoList.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.validation.constraints.NotNull;

@Entity
@Table(uniqueConstraints = {@UniqueConstraint(columnNames={"IDSPRINT", "IDUSUARIO"})})
public class SprintUsuario {

    @Id  
    @NotNull
    private int IDSPRINT;

    @NotNull
    private int IDUSUARIO;

    public SprintUsuario() {
    }

    public SprintUsuario(int IDSPRINT, int IDUSUARIO) {
        this.IDSPRINT = IDSPRINT;
        this.IDUSUARIO = IDUSUARIO;
    }

    // Getters and Setters
    public int getIDSPRINT() {
        return IDSPRINT;
    }

    public void setIDSPRINT(int IDSPRINT) {
        this.IDSPRINT = IDSPRINT;
    }

    public int getIDUSUARIO() {
        return IDUSUARIO;
    }

    public void setIDUSUARIO(int IDUSUARIO) {
        this.IDUSUARIO = IDUSUARIO;
    }

    @Override
    public String toString() {
        return "SprintUsuario{" +
                "IDSPRINT=" + IDSPRINT +
                ", IDUSUARIO=" + IDUSUARIO +
                '}';
    }
}