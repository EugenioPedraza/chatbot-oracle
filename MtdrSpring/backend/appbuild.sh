docker stop springapp
docker rm -f springapp
mvn verify
docker build -f Dockerfile --platform linux/amd64 -t todolistapp-springboot:0.1 .  
docker run --name springapp -p 8080:8080 -d todolistapp-springboot:0.1
