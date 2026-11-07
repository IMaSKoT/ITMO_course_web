package ru.itmo.dormitory.dto;

public class TokenResponse {

    public String accessToken;

    public TokenResponse(String accessToken) {
        this.accessToken = accessToken;
    }
}
