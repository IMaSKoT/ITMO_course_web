package ru.itmo.dormitory.security;

import jakarta.ws.rs.NameBinding;
import ru.itmo.dormitory.entity.Role;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * на помеченных эндпоинтах срабатывает JwtAuthFilter
 * без параметров пускает любого вошедшего пользователя, @Secured(Role.ADMIN) только админа
 */
@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface Secured {
    Role[] value() default {Role.USER, Role.ADMIN};
}
