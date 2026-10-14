# Лабораторная работа №3 — Backend на Jakarta EE с авторизацией

Backend системы студентов общежития из лабы 2, перенесённый на Java.

**Вариант:** Jakarta EE 10 (сервер Payara Micro) + JPA / EclipseLink + PostgreSQL, авторизация через JWT.

## Что нужно установить

- JDK 17 или 21
- Maven (или IntelliJ IDEA — в ней Maven уже встроен)
- PostgreSQL

## Запуск

```bash
# 1. Конфигурация: скопировать пример и при желании поменять значения
cp .env.example .env            # Windows: copy .env.example .env

# 2. База данных: создайте в PostgreSQL пользователя и базу из .env (DB_USER, DB_PASSWORD, DB_NAME)
psql -U postgres -c "CREATE USER dormitory WITH PASSWORD 'dormitory';"
psql -U postgres -c "CREATE DATABASE dormitory OWNER dormitory;"

# 3. Сборка: получится target/dormitory.war, рядом скачается сервер target/payara-micro.jar
mvn package

# 4. Запуск
./run.sh                        # Linux / macOS
.\run.ps1                       # Windows (PowerShell)
```

Скрипт `run` читает `.env` и запускает `java -jar target/payara-micro.jar --deploy target/dormitory.war`.
Таблицы EclipseLink создаёт сам при первом запуске. Тогда же создаётся администратор (`ADMIN_USERNAME` / `ADMIN_PASSWORD` из `.env`)
и загружаются 9 студентов из лабы 2 (`src/main/resources/seed/students.json`), если таблица пустая.

После запуска:

- API: http://localhost:8080/api/requests
- Swagger UI: http://localhost:8080/swagger.html
- Спецификация OpenAPI: http://localhost:8080/openapi

## Postman

Импортируйте `postman/lab3.postman_collection.json` и запустите коллекцию целиком (Run collection) — папки идут по порядку:
1. Авторизация — регистрация, вход ADMIN и USER, обновление токенов, повторный refresh старым токеном (401)
2. Студенты (ADMIN) — список, поиск/фильтры/сортировка/пагинация, QUERY, CRUD, ошибки 404/409/422
3. Роли и доступ — USER читает (200), но не меняет (403); без токена и с поддельным токеном — 401

Токены сохраняются в переменные коллекции автоматически. Если запускаете коллекцию второй раз, «Регистрация USER» вернёт 409 — это нормально, пользователь уже есть.

## API

| Метод | Путь | Кто может | Что делает |
|---|---|---|---|
| POST | `/api/auth/register` | все | регистрация (роль USER) |
| POST | `/api/auth/login` | все | вход → `accessToken` + `refreshToken` |
| POST | `/api/auth/refresh` | все | новая пара токенов по refresh-токену |
| GET | `/api/requests` | USER, ADMIN | список студентов |
| QUERY | `/api/requests` | USER, ADMIN | то же, параметры в JSON-теле |
| GET | `/api/requests/{isuId}` | USER, ADMIN | один студент |
| POST | `/api/requests` | ADMIN | создать |
| PUT | `/api/requests/{isuId}` | ADMIN | полностью заменить |
| PATCH | `/api/requests/{isuId}` | ADMIN | частично изменить |
| DELETE | `/api/requests/{isuId}` | ADMIN | удалить |

Защищённые запросы — с заголовком `Authorization: Bearer <accessToken>`.

**Параметры списка:**
- поиск: `fullName` — подстрока ФИО без учёта регистра
- фильтры: `group`, `isuId`, `hasDormitory`, `dormitory`, `room`, `settlementPeriod` (ГГГГ-ММ-ДД), `isForeign`
- сортировка: `sort` = `fullName | group | isuId | dormitory | room | settlementPeriod`, `order` = `asc | desc`
- пагинация: `page` (с 1), `size` (1–100, по умолчанию 10)

Пример: `GET /api/requests?fullName=ов&hasDormitory=true&sort=isuId&order=desc&page=1&size=5`

Ответ списка:
```json
{ "items": [ ... ], "page": 1, "size": 5, "totalItems": 7, "totalPages": 2 }
```

**Ошибки** — везде в одном формате (как в лабе 2):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [ { "field": "isuId", "message": "..." } ] } }
```
400 — битый JSON, 401 — нет или неверный токен, 403 — не хватает прав, 404 — не найдено, 409 — дубликат (ИСУ, username, email), 422 — ошибка валидации, 500 — внутренняя ошибка.

## Структура проекта (слои)

```
src/main/java/ru/itmo/dormitory/
├── JaxrsApplication.java      точка входа JAX-RS (@ApplicationPath("/api")) + описание для Swagger
├── resource/                  HTTP-слой: принимает запрос, отдаёт ответ (аналог routes.py)
├── service/                   бизнес-логика (StudentService, AuthService, JwtService)
├── repository/                доступ к БД через JPA EntityManager
├── entity/                    JPA-сущности = таблицы (Student, User, RefreshToken)
├── dto/                       то, что приходит и уходит через API (отделено от сущностей)
├── security/                  JwtAuthenticationMechanism — проверка токена (Jakarta Security)
├── error/                     ApiException и обработчики ошибок (ExceptionMapper)
└── config/                    DataSource, стартовые данные, настройки JSON
```

## Где что реализовано (для защиты)

- **Хранение в БД** — `entity/*`, `persistence.xml`; DataSource в `config/DataInitializer` (`@DataSourceDefinition`, параметры через `${ENV=...}`)
- **Транзакции** — `@Transactional` на методах сервисов; изменения сохраняются при коммите (dirty checking в `StudentService.replace`)
- **Связь между таблицами** — `RefreshToken` → `User` (`@ManyToOne`, внешний ключ `user_id`)
- **Хеширование паролей** — BCrypt в `AuthService` (соль внутри хеша, стоимость 12)
- **JWT** — `JwtService`: подпись HS256, проверка алгоритма, подписи, `iss` и `exp`; access живёт 15 минут
- **Refresh-токены** — случайная строка, в БД лежит её SHA-256 хеш; при обновлении старый отзывается (ротация)
- **Роли** — Jakarta Security: `JwtAuthenticationMechanism` (свой `HttpAuthenticationMechanism`) проверяет токен и сообщает контейнеру пользователя и роль, `@RolesAllowed` на `StudentResource` проверяет права: 401 — кто вы неизвестно, 403 — прав не хватает
- **Валидация** — Bean Validation в DTO (`@NotNull`, `@Pattern`, `@Min`...) + правила в `StudentService` (общежитие заполнено целиком, дата не раньше 2000 года) + проверки уникальности
- **Централизованные ошибки** — `error/*ExceptionMapper`
- **Логирование** — `java.util.logging` в сервисах, механизме аутентификации и обработчике ошибок
- **Конфигурация** — `.env` → переменные окружения → MicroProfile Config (`@ConfigProperty`); пример в `.env.example`
- **Swagger** — MicroProfile OpenAPI (`@Operation`, `@Tag`, `@SecurityScheme`) + `swagger.html`
