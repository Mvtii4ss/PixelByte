package cl.pixelbyte.pixelbyte_api.model;

import jakarta.persistence.*;
import java.util.*;
@Entity @Table(name="ordenes")
public class Orden {
 @Id @Column(length=40) public String id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="usuario_id",nullable=false) public Usuario usuario;
 @Column(nullable=false,length=40) public String fecha;
 @Embedded public Cliente cliente;
 @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="orden_detalles",joinColumns=@JoinColumn(name="orden_id")) @OrderColumn(name="linea") public List<Item> items=new ArrayList<>();
 public long total;
 @Column(nullable=false,length=40) public String estado;
 @Embeddable public static class Cliente {
  @Column(length=100) public String nombre,email,region,comuna;
  @Column(length=300) public String direccion,indicaciones;
  @Column(length=20) public String envio;
 }
 @Embeddable public static class Item {
  @Column(name="producto_id",length=30) public String id;
  @Column(length=100) public String name;
  public int price,quantity;
 }
}
