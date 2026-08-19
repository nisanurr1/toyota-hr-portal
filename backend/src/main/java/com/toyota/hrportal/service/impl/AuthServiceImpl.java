package com.toyota.hrportal.service.impl;

import com.toyota.hrportal.dto.LoginRequest;
import com.toyota.hrportal.dto.LoginResponse;
import com.toyota.hrportal.entity.User;
import com.toyota.hrportal.repository.UserRepository;
import com.toyota.hrportal.service.AuthService;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // 1. E-postaya göre kullanıyı veritabanından çek
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Bu e-posta adresine ait kullanıcı bulunamadı!"));

        // 2. Şifre kontrolü
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Girdiğiniz şifre hatalı!");
        }

        // 3. Kullanıcının Rol İsmini Yakala (Null-Safe)
        String roleName = "EMPLOYEE";
        if (user.getRole() != null && user.getRole().getRoleName() != null) {
            roleName = user.getRole().getRoleName();
        }

        // 4. Token üretimi (Mock veya JWT)
        String token = "mock-jwt-token-" + user.getId();

        // 5. Giriş yapan GERÇEK kullanıcının bilgilerini yanıta koy!
        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getSurname(),
                roleName,
                user.getEmail()
        );
    }
}