package ru.itmo.dormitory.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import ru.itmo.dormitory.validation.Password;

public class RegisterRequest {

    @NotNull(message = "Логин обязателен")
    @Pattern(regexp = "^[A-Za-z0-9_]{3,32}$",
            message = "Логин: 3-32 символа, латиница, цифры и _")
    public String username;

    @NotBlank(message = "Email обязателен")
    @Email(message = "Некорректный email")
    @Size(max = 255, message = "Email не длиннее 255 символов")
    public String email;

    @Password
    public String password;
}
