package com.springboot.MyTodoList.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "TAREA")
public class Tarea {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int IDTarea;
    @Column(name = "IDUSUARIO")
    int IDUsuario;
    @Column(name = "IDSPRINT")
    int IDSprint;
    @Column(name = "DESCRIPCIONTAREA")
    String descripcionTarea;
    @Column(name = "ESTADOTAREA")
    boolean estadoTarea;
    @Column(name = "FECHAVENCIMIENTO")
    Date fechaVencimiento;
    @Column(name = "FECHAASIGNACION")
    Date fechaAsignacion;
    @Column(name = "PUNTOS")
    int puntos;
    @Column(name  = "FECHAINICIO")
    Date fechaInicio;
    @Column(name = "FECHAFIN")
    Date fechaFin;
    @Column(name = "HORAS")
    Integer horas; // Changed from int to Integer

    public Tarea() {
        this.fechaInicio = null;
        this.fechaFin = null;
        this.horas = 0;
    }

    public Tarea(int IDTarea, int IDUsuario, int IDSprint, String descripcionTarea, boolean estadoTarea, Date fechaVencimiento, Date fechaAsignacion, int puntos) {
        this.IDTarea = IDTarea;
        this.IDUsuario = IDUsuario;
        this.IDSprint = IDSprint;
        this.descripcionTarea = descripcionTarea;
        this.estadoTarea = estadoTarea;
        this.fechaVencimiento = fechaVencimiento;
        this.fechaAsignacion = fechaAsignacion;
        this.puntos = puntos;
        this.fechaInicio = null;
        this.fechaFin = null;
        this.horas = 0;
    }

    // Setters
    public void setIDTarea(int IDTarea) {
        this.IDTarea = IDTarea;
    }

    public void setIDUsuario(int IDUsuario) {
        this.IDUsuario = IDUsuario;
    }

    public void setIDSprint(int IDSprint) {
        this.IDSprint = IDSprint;
    }

    public void setDescripcionTarea(String descripcionTarea) {
        this.descripcionTarea = descripcionTarea;
    }

    public void setEstadoTarea(boolean estadoTarea) {
        this.estadoTarea = estadoTarea;
    }

    public void setFechaVencimiento(Date fechaVencimiento) {
        this.fechaVencimiento = fechaVencimiento;
    }

    public void setFechaAsignacion(Date fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }

    public void setPuntos(int puntos) {
        this.puntos = puntos;
    }

    public void setFechaInicio(Date fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public void setFechaFin(Date fechaFin) {
        this.fechaFin = fechaFin;
    }

    public void setHoras(Integer horas) {
        this.horas = horas;
    }

    // Getters
    public int getIDTarea() {
        return IDTarea;
    }

    public int getIDUsuario() {
        return IDUsuario;
    }

    public int getIDSprint() {
        return IDSprint;
    }

    public String getDescripcionTarea() {
        return descripcionTarea;
    }

    public boolean getEstadoTarea() {
        return estadoTarea;
    }

    public Date getFechaVencimiento() {
        return fechaVencimiento;
    }

    public Date getFechaAsignacion() {
        return fechaAsignacion;
    }

    public int getPuntos() {
        return puntos;
    }

    public Date getFechaInicio() {
        return fechaInicio;
    }

    public Date getFechaFin() {
        return fechaFin;
    }

    public Integer getHoras() {
        return horas != null ? horas : 0; // Default to 0 if null
    }

    @Override
    public String toString() {
        return "Tarea{" +
                "IDTarea=" + IDTarea +
                ", IDUsuario=" + IDUsuario +
                ", IDSprint=" + IDSprint +
                ", descripcionTarea='" + descripcionTarea + '\'' +
                ", estadoTarea=" + estadoTarea +
                ", fechaVencimiento=" + (fechaVencimiento != null ? fechaVencimiento : "undefined") +
                ", fechaAsignacion=" + (fechaAsignacion != null ? fechaAsignacion : "undefined") +
                ", puntos=" + puntos +
                ", fechaInicio=" + (fechaInicio != null ? fechaInicio : "undefined") +
                ", fechaFin=" + (fechaFin != null ? fechaFin : "undefined") +
                ", horas=" + getHoras() +
                '}';
    }
}