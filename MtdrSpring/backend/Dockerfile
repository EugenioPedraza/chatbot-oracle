FROM openjdk:22
#COPY pom.xml /tmp/
#COPY src /tmp/src/
WORKDIR /tmp/
EXPOSE 8080
ENV db_user = "todouser"
ENV dbpassword = "None"
ENV db_url = "jdbc:oracle:thin:@reacttodov5j1u_tp?TNS_ADMIN=/tmp/wallet"
ENV driver_class_name = "oracle.jdbc.OracleDriver"
ENV _JAVA_OPTIONS=-Dlogging.level.org.springframework=DEBUG
COPY target/MyTodoList-0.0.1-SNAPSHOT.jar MyTodoList.jar
RUN mkdir -p /mtdrworkshop/creds
COPY wallet /tmp/wallet
ENTRYPOINT ["java","-jar","MyTodoList.jar"]