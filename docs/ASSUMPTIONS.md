# Proje Varsayımları ve Bilinen Kısıtlamalar (Assumptions & Limitations)

Bu doküman, **Toyota İK Portalı** projesini bireysel olarak geliştirirken temel aldığım kabulleri, aldığım mimari kararları ve zaman/kapsam nedeniyle mevcut aşamada sınırlı tuttuğum teknik noktaları açıklamaktadır.

---

## Varsayımlarım (Assumptions)

1. **Sistem Rolleri ve İlk Kullanıcılar:**
   - Sistemde 3 farklı rol tanımlanmıştır: `ADMIN`, `HR` (İnsan Kaynakları) ve `EMPLOYEE` (Çalışan).
   - Geliştirme ve test aşamalarını kolaylaştırmak amacıyla, sistemdeki ilk yönetici (`ADMIN`) ve İK (`HR`) hesaplarının veritabanı başlangıç verileri (seed data / SQL script) ile önceden yüklendiği varsayılmıştır.

2. **İzin ve Profil Güncelleme Talep Akışları:**
   - Çalışanların (`EMPLOYEE`) oluşturduğu izin talepleri ve profil bilgi değişikliği istekleri doğrudan ana verilere yansımaz; önce `PENDING` (Beklemede) durumuna düşer.
   - Bu talepler yalnızca İK/Admin yetkilileri tarafından `APPROVED` (Onaylandı) veya `REJECTED` (Reddedildi) durumuna getirilebilir.
   - Sonuçlanmış (onaylanmış veya reddedilmiş) bir talep üzerinde çalışan tarafından tekrar düzenleme yapılamaz.

3. **Veritabanı Yapısı:**
   - Projenin geliştirme ve test ortamında ilişkisel veritabanı olarak **MySQL** kullanılmıştır.
   - Spring Data JPA / Hibernate ayarları (`spring.jpa.hibernate.ddl-auto=update`) kullanılarak veritabanı tablolarının Java Entity sınıflarından otomatik türetildiği varsayılmıştır.

4. **Şifre ve Profil Güvenliği:**
   - Kullanıcıların kendi şifrelerini güncelleyebilmesi için mevcut şifrelerini doğru girmeleri ve yeni şifrenin en az 6 karakterden oluşması kuralı uygulanmıştır.

---

## Bilinen Kısıtlamalar ve Gelecek Geliştirmeler (Known Limitations)

1. **Kimlik Doğrulama ve Güvenlik:**
   - Projede rol tabanlı yetkilendirme (RBAC) ve oturum yönetimi temel düzeyde tutulmuştur. İleriki aşamalarda tam kapsamlı JWT (JSON Web Token) veya OAuth2/Single Sign-On (SSO) mimarisine geçilmesi planlanmaktadır.

2. **Dosya Yükleme Desteği:**
   - İzin taleplerinde (örneğin sağlık raporu/sevk belgesi) veya profil güncellemelerinde dosya/fotoğraf yükleme işlemleri, mevcut sürümde dosya sunucusu (S3/Cloud storage) yerine veritabanında metinsel referanslar üzerinden simüle edilmiştir.

3. **Bildirim Sistemi:**
   - Uygulamanın mevcut sürümünde anlık bildirim (e-posta, SMS veya WebSocket/in-app notification) modülü yer almamaktadır. Talep durum değişikliklerinin takibi doğrudan ilgili listeleme ekranları ve durum parametreleri üzerinden sağlanmaktadır. Bu özelliğin gelecek sürümlerde eklenmesi planlanmaktadır.