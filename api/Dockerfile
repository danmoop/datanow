FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

COPY src/ src/

RUN ./mvnw package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

COPY src/main/resources/application.properties ./config/application.properties

EXPOSE 3000

ENTRYPOINT ["java", \
  "-Dspring.config.location=classpath:/application.properties,file:./config/application.properties", \
  "-jar", "app.jar"]