

<<<<<<< HEAD
<<<<<<< Updated upstream
docker rm springapp
mvn verify
docker build -f Dockerfile --platform linux/amd64 -t todolistapp-springboot:0.1 .  
docker run --name springapp -p 8080:8080 -d todolistapp-springboot:0.1
=======
docker rm springboot
mvn verify
docker build -f Dockerfile -t mx-queretaro-1.ocir.io/ax9ejkhbh4ic/reacttodo/lc4xp/todolistapp-springboot:0.1 .
docker run -it --name springboot -p 8080:8080 mx-queretaro-1.ocir.io/ax9ejkhbh4ic/reacttodo/lc4xp/todolistapp-springboot:0.1
>>>>>>> Stashed changes
=======
docker rm Corr
