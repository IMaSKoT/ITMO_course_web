package ru.itmo.dormitory.resource;

import jakarta.ws.rs.HttpMethod;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

// нестандартный HTTP-метод QUERY: поиск с параметрами в теле запроса
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@HttpMethod("QUERY")
public @interface QUERY {
}
