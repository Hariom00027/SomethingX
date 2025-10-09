FROM gradle:8.3-jdk17-alpine AS build

WORKDIR /app

COPY build.gradle ./
COPY src ./src

RUN gradle build --no-daemon

FROM openjdk:17-jdk-slim

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]