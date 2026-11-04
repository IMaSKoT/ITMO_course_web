package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.NotBlank;

public class RefreshRequest {

    @NotBlank(message = "refreshToken обязателен")
    public String refreshToken;
}
