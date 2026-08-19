# Yapay Zeka Araçlarının Kullanım Açıklaması (AI Usage)

Bu doküman, geliştirme sürecinde yapay zeka destekli araçların (ChatGPT, Gemini vb.) nasıl ve hangi alanlarda kullanıldığını açıklamaktadır.

## Kullanım Kapsamı

1. **İskelet Kod ve Şablon Üretimi :**
   - Standart JPA Entity eşlemeleri, Repository arayüzleri ve DTO yapılarının taslaklarının oluşturulması.
   - Bootstrap tabanlı temel React kullanıcı arayüzü (UI) bileşen düzenlerinin hazırlanması.

2. **Hata Ayıklama ve İyileştirme :**
   - Spring Security çakışmalarının ve JPA `TransientPropertyValueException` hatalarının çözülmesi.
   - React `useState` hook'larının ve Axios istek yapılandırmalarının optimize edilmesi.

3. **Dokümantasyon Üretimi:**
   - Markdown formatındaki proje dokümanlarının, API tanımlarının ve ER diyagramı metinlerinin taslaklanması.

---

## Kontrol ve Sorumlu Kullanım

- **Kod Doğrulanması:** Yapay zeka tarafından önerilen tüm kod parçacıkları manuel olarak incelenmiş, derlenmiş, test edilmiş ve projeye entegre edilmiştir.
- **İş Kuralları Sahipliği:** Temel iş mantığı (şifre doğrulama kuralları, talep durum geçiş kısıtlamaları ve rol tabanlı veri filtreleme) tamamen manuel olarak tasarlanmış ve doğrulanmıştır.