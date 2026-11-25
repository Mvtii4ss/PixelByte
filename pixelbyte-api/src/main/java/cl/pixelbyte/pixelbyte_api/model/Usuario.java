package cl.pixelbyte.pixelbyte_api.model;

import jakarta.persistence.*;
@Entity @Table(name="usuarios")
public class Usuario {
 @Id @Column(length=36) public String id;
 @Column(nullable=false, unique=true,length=100) public String email;
 @Column(nullable=false,length=50) public String nombre;
 @Column(length=100) public String apellidos;
 @Column(unique=true,length=9) public String run;
 @Column(length=100) public String passwordHash;
 @Column(name="rol",nullable=false,length=20) public String role;
 @Column(length=255,unique=true) public String googleSub;
 @Column(length=10) public String fechaNac;
 @Column(length=100) public String region, comuna;
 @Column(length=300) public String direccion;
}
