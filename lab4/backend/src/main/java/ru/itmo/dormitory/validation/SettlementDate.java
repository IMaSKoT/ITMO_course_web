package ru.itmo.dormitory.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SettlementDateValidator.class)
public @interface SettlementDate {

    String message() default "Дата заселения не может быть раньше 2000-01-01";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
