package ru.itmo.dormitory.security;

import jakarta.ws.rs.NameBinding;
import ru.itmo.dormitory.entity.Role;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * своя аннотация "эндпоинт защищён"
 * сама по себе ничего не делает, это просто метка
 * её читает JwtAuthFilter через рефлексию
 *
 * @Secured:             нужен любой вошедший пользователь (USER или ADMIN)
 * @Secured(Role.ADMIN): только ADMIN
 *
 * @NameBinding означает: JwtAuthFilter срабатывает только на методах/классах с этой аннотацией
 */
@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface Secured {
    Role[] value() default {Role.USER, Role.ADMIN};
}
