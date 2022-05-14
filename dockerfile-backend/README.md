Construir a imagem do container back-end:
docker build -t hvescovi/serena:back .

Visualizar imagens:
docker images

Teste:
python3 backend.py 

em outro terminal:
curl localhost:5000
curl localhost:5000/retornar_questoes

Execução do back-end:
docker run -p 5000:5000 -d -v /home/friend/01-github/serena/dockerfile-backend/database:/database hvescovi/serena:back

dar nome para o back-end:
docker run -p 5000:5000 --name serenaback -d -v /home/friend/01-github/serena/dockerfile-backend/database:/database hvescovi/serena:back


Execução do front-end:
docker run -p 80:80 --name serenafront -d -v /home/friend/01-github/serena/dockerfile-frontend/root_html_files/:/usr/share/nginx/html nginx

Acesso no navegador:
http://localhost



* Enviar para o hub.docker:
https://ropenscilabs.github.io/r-docker-tutorial/04-Dockerhub.html

- criar o container:
docker build -t hvescovi/serena-back .
- criar o bd (pra garantir):
python3 modelo.py
- rodar o container localmente:
sudo docker run -p 5000:5000 -d -v /home/friend/01-github/serena/dockerfile-backend/database:/database hvescovi/serena-back
- fazer login do docker no terminal:
sudo docker login --username=hvescovi
 (informa a senha)
- subir o container para o dockerhub:
 sudo docker push  hvescovi/serena-back

- deploy no heroku
https://devcenter.heroku.com/articles/heroku-cli#download-and-install
https://medium.com/@justkrup/deploy-a-docker-container-free-on-heroku-5c803d2fdeb1
https://devcenter.heroku.com/articles/container-registry-and-runtime

heroku login

heroku container:push web --app calm-taiga-45331

heroku container:release web --app calm-taiga-45331



