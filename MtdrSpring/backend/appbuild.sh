docker rm CorrerLocal
mvn verify
docker build -f Dockerfile -t mx-queretaro-1.ocir.io/ax9ejkhbh4ic/reacttodo/lc4xp/todolistapp-springboot:0.1 .
docker run -it --name CorrerLocal -p 8080:8080 mx-queretaro-1.ocir.io/ax9ejkhbh4ic/reacttodo/lc4xp/todolistapp-springboot:0.1
