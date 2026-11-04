package ru.itmo.dormitory.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@NotNull(message = "Пароль обязателен")
@Size(min = 8, max = 72, message = "Пароль от 8 до 72 символов")
@Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "Пароль должен содержать хотя бы одну букву и одну цифру")
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {})
public @interface Password {

    String message() default "Некорректный пароль";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
