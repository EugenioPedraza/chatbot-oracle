package com.springboot.MyTodoList.model;

import javax.persistence.*;

@Entity
@Table(uniqueConstraints = {@UniqueConstraint(columnNames={"IDSPRINT", "IDUSUARIO "})})
public class SprintUsuario {
    @NotNull
    int IDSPRINT;

    @NotNull
    int IDUSUARIO;

    public SprintUsuario() {
    }

    public SprintUsuario(int IDSPRINT, int IDUSUARIO) {
        this.IDSPRINT = IDSPRINT;
        this.IDUSUARIO = IDUSUARIO;
    }

    public int getIDSPRINT() {
        return IDSPRINT;
    }

    public int getIDUSUARIO() {
        return IDUSUARIO;
    }

    public void setIDSPRINT(int IDSPRINT) {
        this.IDSPRINT = IDSPRINT;
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
