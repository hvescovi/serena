FROM nginx:latest
MAINTAINER Hylson "hvescovi@gmail.com"
RUN apt-get update

#RUN export PYTHONIOENCODING=utf-8
#RUN export LC_ALL=en_US.UTF-8

RUN mkdir /usr/share/nginx/html/css
RUN mkdir /usr/share/nginx/html/images
RUN mkdir /usr/share/nginx/html/img
RUN mkdir /usr/share/nginx/html/js

ADD root_html_files/index.html /usr/share/nginx/html/index.html

ADD root_html_files/css/meuestilo.css /usr/share/nginx/html/css/meuestilo.css
ADD root_html_files/images/background.jpg /usr/share/nginx/html/images/background.jpg
ADD root_html_files/images/eyes.jpg /usr/share/nginx/html/images/eyes.jpg

ADD root_html_files/img/site1.png /usr/share/nginx/html/img/site1.png
ADD root_html_files/img/site2.png /usr/share/nginx/html/img/site2.png
ADD root_html_files/img/codigo_grade_bootstrap1.png /usr/share/nginx/html/img/codigo_grade_bootstrap1.png
ADD root_html_files/img/grade_bootstrap1.png /usr/share/nginx/html/img/grade_bootstrap1.png
ADD root_html_files/img/grade_bootstrap2.png /usr/share/nginx/html/img/grade_bootstrap2.png
ADD root_html_files/img/grade_bootstrap3.png /usr/share/nginx/html/img/grade_bootstrap3.png
ADD root_html_files/img/grade_bootstrap4.png /usr/share/nginx/html/img/grade_bootstrap4.png

ADD root_html_files/circulo.html /usr/share/nginx/html/circulo.html


ADD root_html_files/js/jquery-3.4.1.min.js /usr/share/nginx/html/js/jquery-3.4.1.min.js
ADD root_html_files/js/meuscript.js /usr/share/nginx/html/js/meuscript.js
ADD root_html_files/js/meuscript.js /usr/share/nginx/html/js/circulo.js
ADD root_html_files/js/jquerysession.js /usr/share/nginx/html/js/jquerysession.js


ADD root_html_files/android-icon-144x144.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-57x57.png  /usr/share/nginx/html/
ADD root_html_files/favicon.ico /usr/share/nginx/html/
ADD root_html_files/android-icon-192x192.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-60x60.png  /usr/share/nginx/html/
ADD root_html_files/android-icon-36x36.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-72x72.png  /usr/share/nginx/html/
ADD root_html_files/android-icon-48x48.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-76x76.png /usr/share/nginx/html/
ADD root_html_files/android-icon-72x72.png /usr/share/nginx/html/
ADD root_html_files/apple-icon.png /usr/share/nginx/html/
ADD root_html_files/android-icon-96x96.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-precomposed.png /usr/share/nginx/html/
ADD root_html_files/manifest.json /usr/share/nginx/html/
ADD root_html_files/apple-icon-114x114.png /usr/share/nginx/html/
ADD root_html_files/browserconfig.xml /usr/share/nginx/html/
ADD root_html_files/ms-icon-144x144.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-120x120.png /usr/share/nginx/html/
ADD root_html_files/ms-icon-150x150.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-144x144.png /usr/share/nginx/html/
ADD root_html_files/favicon-16x16.png /usr/share/nginx/html/
ADD root_html_files/ms-icon-310x310.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-152x152.png /usr/share/nginx/html/
ADD root_html_files/favicon-32x32.png /usr/share/nginx/html/
ADD root_html_files/ms-icon-70x70.png /usr/share/nginx/html/
ADD root_html_files/apple-icon-180x180.png /usr/share/nginx/html/
ADD root_html_files/favicon-96x96.png /usr/share/nginx/html/


#ADD inicializa.sh /inicializa.sh
#RUN chmod +x /inicializa.sh
#ENTRYPOINT ["/inicializa.sh"]