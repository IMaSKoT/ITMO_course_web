package ru.itmo.dormitory.dto;

/** ответ на /auth/login и /auth/refresh */
public class TokenResponse {

    public String accessToken;
    public String refreshToken;
    public String tokenType = "Bearer";
    // сколько секунд живёт access-токен
    public long expiresIn;
    public UserResponse user;

    public TokenResponse(String accessToken, String refreshToken, long expiresIn, UserResponse user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.user = user;
    }
}
