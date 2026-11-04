package ru.itmo.dormitory.security;

import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.bind.Jsonb;
import jakarta.json.bind.JsonbBuilder;
import jakarta.security.enterprise.AuthenticationStatus;
import jakarta.security.enterprise.authentication.mechanism.http.HttpAuthenticationMechanism;
import jakarta.security.enterprise.authentication.mechanism.http.HttpMessageContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import ru.itmo.dormitory.dto.ErrorResponse;
import ru.itmo.dormitory.error.ApiException;
import ru.itmo.dormitory.service.JwtService;

import java.io.IOException;
import java.util.Set;
import java.util.logging.Logger;

@ApplicationScoped
public class JwtAuthenticationMechanism implements HttpAuthenticationMechanism {

    private static final Logger LOG = Logger.getLogger(JwtAuthenticationMechanism.class.getName());
    private static final Jsonb JSONB = JsonbBuilder.create();
    private static final String BEARER_PREFIX = "Bearer ";

    @Inject
    private JwtService jwtService;

    @Override
    public AuthenticationStatus validateRequest(HttpServletRequest request, HttpServletResponse response,
                                                HttpMessageContext context) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER_PREFIX)) {

            return context.doNothing();
        }

        try {
            JWTClaimsSet claims = jwtService.verifyAccessToken(header.substring(BEARER_PREFIX.length()).trim());
            String role = (String) claims.getClaim("role");
            return context.notifyContainerAboutLogin(claims.getSubject(), Set.of(role));
        } catch (ApiException e) {

            LOG.info("Rejected token: " + e.getCode());
            return writeError(response, e);
        }
    }

    private AuthenticationStatus writeError(HttpServletResponse response, ApiException e) {
        response.setStatus(e.getStatus());
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        try {
            response.getWriter().write(JSONB.toJson(ErrorResponse.of(e.getCode(), e.getMessage())));
        } catch (IOException ignored) {

        }
        return AuthenticationStatus.SEND_FAILURE;
    }
}
