package com.toyota.hrportal.entity;
import jakarta.persistence.*;

@Entity /*Bu sınıfın bir veritabanı tablosu olduğunu Hibenate'e söyler */
@Table(name = "roles") /*tablonun adı roles olacak*/
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // id otomatik oluşturulur.
    private Long id;

    @Column(nullable = false, unique = true) // roller boş bırakılamaz ve aynı isimde 2 farklı rol olamaz
    private String roleName;

    public Role() {
    }

    public Role(Long id, String roleName) {
        this.id = id;
        this.roleName = roleName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}