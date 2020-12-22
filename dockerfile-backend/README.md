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

Execução do front-end:
docker run -p 80:80 -d -v /home/friend/01-github/serena/dockerfile-frontend/root_html_files/:/usr/share/nginx/html nginx

Acesso no navegador:
http://localhost