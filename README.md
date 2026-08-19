# Toyota İK Portalı Sistemi (Toyota HR Portal)

Bu proje, **Java Spring Boot** (Backend), **React** (Frontend) ve **MySQL** ilişkisel veritabanı kullanılarak geliştirilmiş tam kapsamlı bir İnsan Kaynakları Yönetim Portalılıdır.

---

## Uygulanan Kapsam ve Özellikler

- **Kullanıcı ve Rol Yönetimi (RBAC):** `ADMIN`, `HR` ve `EMPLOYEE` rollerini kapsayan rol tabanlı yetkilendirme mimarisi. Admin/İşletme paneli üzerinden dinamik rol seçimiyle yeni çalışan kaydı.
- **İzin Talepleri Yönetimi:** Çalışanların izin talebi oluşturması; İK/Admin yetkililerinin bu talepleri onaylaması veya reddetmesi.
- **Profil Güncelleme Talepleri:** Çalışanların kişisel bilgilerini güncelleme isteklerinin İK onay mekanizmasından geçirilerek yönetilmesi.
- **Doğrudan Şifre Güncelleme:** Aktif kullanıcıların mevcut şifre doğrulamasıyla veritabanı üzerindeki şifrelerini anında değiştirebilmesi.

---

## Kullanılan Teknolojiler

- **Frontend:** React.js, Bootstrap 5, Axios, JavaScript (ES6+)
- **Backend:** Java 17/21, Spring Boot 3, Spring Data JPA, Spring Security
- **Veritabanı:** MySQL
- **ORM / Veri Katmanı:** Hibernate / JPA

---

## Kurulum ve Çalıştırma Talimatları

### 1. Veritabanı Kurulumu
1. MySQL üzerinde `hr_portal` adında bir veritabanı oluşturun.
2. Veritabanı bağlantı bilgilerinizi `backend/src/main/resources/application.properties` dosyası içerisinde düzenleyin:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hr_portal
spring.datasource.username=MYSQL_KULLANICI_ADI
spring.datasource.password=MYSQL_SIFRE