package com.toyota.hrportal.dto;

public class LoginResponse {
    private String token;
    private Long userId;
    private String name;
    private String surname;
    private String role;
    private String email;

    public LoginResponse() {}

    public LoginResponse(String token, Long userId, String name, String surname, String role, String email) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.surname = surname;
        this.role = role;
        this.email = email;
    }

    // Getter ve Setter Metotları
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSurname() { return surname; }
    public void setSurname(String surname) { this.surname = surname; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}