package com.toyota.hrportal.controller;

import com.toyota.hrportal.dto.LoginRequest;
import com.toyota.hrportal.dto.LoginResponse;
import com.toyota.hrportal.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Şifre yanlış veya kullanıcı bulunamadığında 401 Unauthorized döner
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            // Beklenmeyen bir sunucu hatasında konsola hatanın detayını basar ve 500 döner
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Giriş sırasında sunucu hatası oluştu: " + e.getMessage());
        }
    }
}