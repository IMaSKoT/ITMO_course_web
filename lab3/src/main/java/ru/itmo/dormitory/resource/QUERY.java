package ru.itmo.dormitory.resource;

import jakarta.ws.rs.HttpMethod;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * HTTP-метод QUERY (как во 2-й лабе): поиск с параметрами в JSON-теле
 * в JAX-RS любой свой метод объявляется аннотацией с @HttpMethod
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@HttpMethod("QUERY")
public @interface QUERY {
}
