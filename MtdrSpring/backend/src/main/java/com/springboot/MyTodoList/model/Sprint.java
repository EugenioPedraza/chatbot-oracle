package com.springboot.MyTodoList.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table (name = "SPRINT")
public class Sprint {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    int IDSprint;
    @Column (name = "NOMBRESPRINT")
    String nombreSprint;
    // CONFIRMAR QUE EL TIPO DE DATO FUNCIONE CON LA BASE DE DATOS
    @Column (name = "FECHAINICIO")
    Date fechaInicio;
    @Column (name = "FECHAFIN")
    Date fechaFin;
    @Column (name = "ESTADOSPRINT")
    boolean estadoSprint;

    public Sprint() {

    }

    public Sprint(int ID, String nombreSprint, Date fechaInicio, Date fechaFin, boolean estadoSprint) {
        this.ID = ID;
        this.nombreSprint = nombreSprint;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estadoSprint = estadoSprint;
    }

    public int getID() {
        return IDSprint;
    }

    public String getNombreSprint() {
        return nombreSprint;
    }

    public Date getFechaInicio() {
        return fechaInicio;
    }

    public Date getFechaFin() {
        return fechaFin;
    }

    public boolean getEstadoSprint() {
        return estadoSprint;
    }

    public void setID(int ID) {
        this.IDSprint = ID;
    }

    public void setNombreSprint(String nombreSprint) {
        this.nombreSprint = nombreSprint;
    }

    public void setFechaInicio(Date fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public void setFechaFin(Date fechaFin) {
        this.fechaFin = fechaFin;
    }

    public void setEstadoSprint(boolean estadoSprint) {
        this.estadoSprint = estadoSprint;
    }

    @Override
    public String toString() {
        return "Sprint{" +
                "ID=" + IDSprint +
                ", nombreSprint='" + nombreSprint + '\'' +
                ", fechaInicio=" + fechaInicio +
                ", fechaFin=" + fechaFin +
                ", estadoSprint=" + estadoSprint +
                '}';
    }
}