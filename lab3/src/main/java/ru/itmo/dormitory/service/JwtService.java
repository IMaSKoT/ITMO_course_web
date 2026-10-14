package ru.itmo.dormitory.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import ru.itmo.dormitory.entity.Role;
import ru.itmo.dormitory.entity.User;
import ru.itmo.dormitory.error.ApiException;
import ru.itmo.dormitory.security.AuthenticatedUser;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

// access-токены: JWT с подписью HS256
@ApplicationScoped
public class JwtService {

    @Inject
    @ConfigProperty(name = "jwt.secret")
    private String secret;

    @Inject
    @ConfigProperty(name = "jwt.issuer", defaultValue = "dormitory-app")
    private String issuer;

    @Inject
    @ConfigProperty(name = "jwt.access-ttl-minutes", defaultValue = "15")
    private long accessTtlMinutes;

    private byte[] secretBytes;

    @PostConstruct
    void init() {
        secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET должен быть не короче 32 символов");
        }
    }

    public long getAccessTtlSeconds() {
        return accessTtlMinutes * 60;
    }

    public String createAccessToken(User user) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(accessTtlMinutes, ChronoUnit.MINUTES)))
                .build();
        try {
            SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            jwt.sign(new MACSigner(secretBytes));
            return jwt.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Не удалось подписать JWT", e);
        }
    }

    public AuthenticatedUser verifyAccessToken(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);
            // алгоритм проверяем сами, а не берём из заголовка токена, иначе пролезет alg=none
            boolean validSignature = JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm())
                    && jwt.verify(new MACVerifier(secretBytes));
            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            String username = claims.getSubject();
            String role = claims.getStringClaim("role");

            if (!validSignature || !issuer.equals(claims.getIssuer()) || username == null || role == null) {
                throw invalidToken();
            }
            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.before(new Date())) {
                throw ApiException.unauthorized("TOKEN_EXPIRED",
                        "Срок действия access-токена истёк, обновите его через /api/auth/refresh");
            }
            return new AuthenticatedUser(username, Role.valueOf(role));
        } catch (ParseException | JOSEException | IllegalArgumentException e) {
            throw invalidToken();
        }
    }

    private ApiException invalidToken() {
        return ApiException.unauthorized("INVALID_TOKEN", "Недействительный access-токен");
    }
}
