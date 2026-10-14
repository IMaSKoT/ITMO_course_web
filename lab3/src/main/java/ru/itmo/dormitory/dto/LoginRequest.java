package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "Имя пользователя обязательно")
    public String username;

    @NotBlank(message = "Пароль обязателен")
    public String password;
}
