package ru.itmo.dormitory.dto;

// ответ на /auth/login и /auth/refresh
public class TokenResponse {

    public String accessToken;
    public String refreshToken;

    public TokenResponse(String accessToken, String refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }
}
