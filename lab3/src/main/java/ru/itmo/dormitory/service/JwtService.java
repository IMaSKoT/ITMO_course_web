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

/**
 * создание и проверка access-токенов (JWT, подпись HS256 общим секретом)
 * сами криптографические операции делает библиотека Nimbus JOSE + JWT
 */
@ApplicationScoped
public class JwtService {

    // значения берутся из переменных окружения JWT_SECRET, JWT_ISSUER, JWT_ACCESS_TTL_MINUTES
    @Inject
    @ConfigProperty(name = "jwt.secret")
    String secret;

    @Inject
    @ConfigProperty(name = "jwt.issuer", defaultValue = "dormitory-app")
    String issuer;

    @Inject
    @ConfigProperty(name = "jwt.access-ttl-minutes", defaultValue = "15")
    long accessTtlMinutes;

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

    /** проверяет токен и возвращает пользователя, любая проблема -> 401 */
    public AuthenticatedUser verifyAccessToken(String token) {
        try {
            SignedJWT jwt = SignedJWT.parse(token);

            // алгоритм задаёт сервер, а не заголовок токена (защита от alg=none)
            if (!JWSAlgorithm.HS256.equals(jwt.getHeader().getAlgorithm())) {
                throw invalidToken();
            }
            // подпись: без неё кто угодно мог бы вписать себе role=ADMIN
            if (!jwt.verify(new MACVerifier(secretBytes))) {
                throw invalidToken();
            }

            JWTClaimsSet claims = jwt.getJWTClaimsSet();
            // токен выдал наш сервер
            if (!issuer.equals(claims.getIssuer())) {
                throw invalidToken();
            }
            Date expiration = claims.getExpirationTime();
            if (expiration == null || expiration.before(new Date())) {
                throw ApiException.unauthorized("TOKEN_EXPIRED",
                        "Срок действия access-токена истёк, обновите его через /api/auth/refresh");
            }

            String username = claims.getSubject();
            Role role = Role.valueOf(claims.getStringClaim("role"));
            return new AuthenticatedUser(username, role);
        } catch (ParseException | JOSEException | IllegalArgumentException | NullPointerException e) {
            throw invalidToken();
        }
    }

    private ApiException invalidToken() {
        return ApiException.unauthorized("INVALID_TOKEN", "Недействительный access-токен");
    }
}
