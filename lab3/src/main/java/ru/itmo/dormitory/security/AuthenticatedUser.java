package ru.itmo.dormitory.security;

import ru.itmo.dormitory.entity.Role;

import java.security.Principal;

/** кто делает запрос, достаём из проверенного access-токена */
public class AuthenticatedUser implements Principal {

    private final String username;
    private final Role role;

    public AuthenticatedUser(String username, Role role) {
        this.username = username;
        this.role = role;
    }

    @Override
    public String getName() {
        return username;
    }

    public Role getRole() {
        return role;
    }
}
