package cl.pixelbyte.pixelbyte_api.model;

import jakarta.persistence.*;
@Entity @Table(name="mensajes") public class Mensaje {
 @Id @Column(length=40) public String id;
 @Column(nullable=false,length=100) public String nombre,email;
 @Column(nullable=false,length=500) public String motivo;
 @Column(nullable=false,length=40) public String fecha;
}
