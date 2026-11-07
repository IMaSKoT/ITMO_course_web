package ru.itmo.dormitory.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;

public class SettlementDateValidator implements ConstraintValidator<SettlementDate, LocalDate> {

    public static final LocalDate MIN_DATE = LocalDate.of(2000, 1, 1);

    @Override
    public boolean isValid(LocalDate value, ConstraintValidatorContext context) {
        return value == null || !value.isBefore(MIN_DATE);
    }
}
