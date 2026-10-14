package ru.itmo.dormitory.security;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.container.ResourceInfo;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.ext.Provider;
import ru.itmo.dormitory.entity.Role;
import ru.itmo.dormitory.error.ApiException;
import ru.itmo.dormitory.service.JwtService;

import java.lang.reflect.Method;
import java.security.Principal;
import java.util.Arrays;
import java.util.logging.Logger;

/**
 * фильтр, который выполняется ДО метода ресурса (до контроллера)
 * 1) аутентификация: достаём токен из "Authorization: Bearer ..." и проверяем его -> иначе 401
 * 2) авторизация: сверяем роль пользователя с @Secured(...) на методе -> иначе 403
 */
@Secured
@Provider
@Priority(Priorities.AUTHENTICATION)
public class JwtAuthFilter implements ContainerRequestFilter {

    private static final Logger LOG = Logger.getLogger(JwtAuthFilter.class.getName());
    private static final String BEARER_PREFIX = "Bearer ";

    @Context
    private ResourceInfo resourceInfo;

    @Inject
    private JwtService jwtService;

    @Override
    public void filter(ContainerRequestContext request) {
        // ---- 1) аутентификация: кто это? ----
        String header = request.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw ApiException.unauthorized("AUTHENTICATION_REQUIRED",
                    "Нужен заголовок Authorization: Bearer <accessToken>");
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        AuthenticatedUser user = jwtService.verifyAccessToken(token);

        // ---- 2) авторизация: что ему можно? ----
        Role[] allowedRoles = findAllowedRoles();
        if (!Arrays.asList(allowedRoles).contains(user.getRole())) {
            LOG.warning("Access denied: user=" + user.getName() + " role=" + user.getRole()
                    + " " + request.getMethod() + " " + request.getUriInfo().getPath());
            throw ApiException.forbidden("Недостаточно прав для этой операции");
        }

        // кладём пользователя в SecurityContext, его можно получить в ресурсе через @Context
        request.setSecurityContext(new TokenSecurityContext(user, request.getSecurityContext().isSecure()));
    }

    /** аннотация на методе важнее аннотации на классе */
    private Role[] findAllowedRoles() {
        Method method = resourceInfo.getResourceMethod();
        Secured secured = method.getAnnotation(Secured.class);
        if (secured == null) {
            secured = resourceInfo.getResourceClass().getAnnotation(Secured.class);
        }
        return secured.value();
    }

    private static class TokenSecurityContext implements SecurityContext {
        private final AuthenticatedUser user;
        private final boolean secure;

        TokenSecurityContext(AuthenticatedUser user, boolean secure) {
            this.user = user;
            this.secure = secure;
        }

        @Override
        public Principal getUserPrincipal() {
            return user;
        }

        @Override
        public boolean isUserInRole(String role) {
            return user.getRole().name().equals(role);
        }

        @Override
        public boolean isSecure() {
            return secure;
        }

        @Override
        public String getAuthenticationScheme() {
            return "Bearer";
        }
    }
}
