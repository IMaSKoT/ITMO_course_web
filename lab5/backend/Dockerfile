FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/dormitory.war dormitory.war
COPY --from=build /app/target/payara-micro.jar payara-micro.jar
EXPOSE 8080
CMD ["java", "-jar", "payara-micro.jar", "--deploy", "dormitory.war", "--contextroot", "ROOT", "--port", "8080", "--nocluster"]
