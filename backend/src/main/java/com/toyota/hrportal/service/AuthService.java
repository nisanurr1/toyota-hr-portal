package com.toyota.hrportal.service;

import com.toyota.hrportal.dto.LoginRequest;
import com.toyota.hrportal.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

}