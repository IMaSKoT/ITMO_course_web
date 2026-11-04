package ru.itmo.dormitory;

import jakarta.annotation.security.DeclareRoles;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;

@ApplicationPath("/api")
@DeclareRoles({"USER", "ADMIN"})
@OpenAPIDefinition(info = @Info(
        title = "Dormitory API",
        version = "3.0",
        description = "Лабораторная работа №3: студенты общежития, JWT-авторизация, роли USER и ADMIN"))
@SecurityScheme(
        securitySchemeName = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT")
public class JaxrsApplication extends Application {
}
