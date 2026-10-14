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

import java.security.Principal;
import java.util.List;
import java.util.logging.Logger;

/**
 * срабатывает перед методами с @Secured
 * нет или битый токен: 401, роль не подходит: 403
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
        String header = request.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw ApiException.unauthorized("AUTHENTICATION_REQUIRED",
                    "Нужен заголовок Authorization: Bearer <accessToken>");
        }
        AuthenticatedUser user = jwtService.verifyAccessToken(header.substring(BEARER_PREFIX.length()).trim());

        if (!allowedRoles().contains(user.getRole())) {
            LOG.warning("Access denied: user=" + user.getName() + " role=" + user.getRole()
                    + " " + request.getMethod() + " " + request.getUriInfo().getPath());
            throw ApiException.forbidden("Недостаточно прав для этой операции");
        }

        boolean secure = request.getSecurityContext().isSecure();
        request.setSecurityContext(new TokenSecurityContext(user, secure));
    }

    // аннотация на методе важнее аннотации на классе
    private List<Role> allowedRoles() {
        Secured secured = resourceInfo.getResourceMethod().getAnnotation(Secured.class);
        if (secured == null) {
            secured = resourceInfo.getResourceClass().getAnnotation(Secured.class);
        }
        return List.of(secured.value());
    }

    private record TokenSecurityContext(AuthenticatedUser user, boolean secure) implements SecurityContext {

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
