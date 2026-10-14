package ru.itmo.dormitory.dto;

import ru.itmo.dormitory.entity.User;

/** данные пользователя для клиента, без хеша пароля */
public class UserResponse {

    public String username;
    public String email;
    public String role;

    public static UserResponse from(User user) {
        UserResponse dto = new UserResponse();
        dto.username = user.getUsername();
        dto.email = user.getEmail();
        dto.role = user.getRole().name();
        return dto;
    }
}
