package com.toyota.hrportal.controller;

import com.toyota.hrportal.entity.Role;
import com.toyota.hrportal.entity.User;
import com.toyota.hrportal.entity.enums.UserStatus;
import com.toyota.hrportal.repository.UserRepository;
import com.toyota.hrportal.repository.RoleRepository;
import com.toyota.hrportal.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.toyota.hrportal.dto.ChangePasswordRequest;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public UserController(UserService userService, RoleRepository roleRepository, UserRepository userRepository) {
        this.userService = userService;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        // Kendi repository veya service yapına göre burayı uyarla:
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            // 1. Varsayılan Alanlar
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                user.setPassword("Toyota123!");
            }
            if (user.getStatus() == null) {
                user.setStatus(UserStatus.ACTIVE);
            }
            if (user.getHireDate() == null) {
                user.setHireDate(LocalDate.now());
            }
            if (user.getChildrenCount() == null) {
                user.setChildrenCount(0);
            }

            // 2. TRANSIENT ROLE HATASINI ÇÖZEN KISIM
            Role persistentRole = null;

            if (user.getRole() != null) {
                // Eğer ID geldiyse veritabanından ID ile çek
                if (user.getRole().getId() != null) {
                    persistentRole = roleRepository.findById(user.getRole().getId()).orElse(null);
                }
                // ID ile bulunamadıysa veya ID yoksa roleName ile veritabanından çek
                if (persistentRole == null && user.getRole().getRoleName() != null) {
                    persistentRole = roleRepository.findByRoleName(user.getRole().getRoleName()).orElse(null);
                }
            }

            // Eğer rol hala null ise veritabanındaki varsayılan 'EMPLOYEE' rolünü çek
            if (persistentRole == null) {
                persistentRole = roleRepository.findByRoleName("EMPLOYEE")
                        .orElseGet(() -> roleRepository.findById(3L).orElse(null));
            }

            // GEÇİCİ NESNE YERİNE VERİTABANINDAN ÇEKİLEN YÖNETİLEN NESNEYİ ATIYORUZ
            user.setRole(persistentRole);

            User savedUser = userService.saveUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Personel eklenirken hata oluştu: " + e.getMessage());
        }
    }
    // ŞİFRE GÜNCELLEME METODU (İK Onaysız, Doğrudan Veritabanında)
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().body("Kullanıcı kimliği bulunamadı.");
            }

            User user = userService.getUserById(request.getUserId());
            if (user == null) {
                return ResponseEntity.badRequest().body("Kullanıcı bulunamadı.");
            }

            // 1. Mevcut Şifre Doğrulaması
            if (!user.getPassword().equals(request.getCurrentPassword())) {
                return ResponseEntity.badRequest().body("Mevcut şifrenizi hatalı girdiniz!");
            }

            // 2. Yeni Şifre Kontrolü
            if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6) {
                return ResponseEntity.badRequest().body("Yeni şifreniz en az 6 karakter olmalıdır.");
            }

            // 3. Doğrudan 'users' tablosunda güncelle
            user.setPassword(request.getNewPassword().trim());
            userService.saveUser(user);

            return ResponseEntity.ok("Şifreniz başarıyla güncellendi! Bir sonraki girişinizde yeni şifrenizi kullanabilirsiniz.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Şifre güncellenirken sunucu hatası oluştu: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}