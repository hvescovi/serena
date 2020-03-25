FROM debian:latest
MAINTAINER Hylson "hvescovi@gmail.com"
RUN apt-get update
RUN apt-get install -y python3 python3-pip wget

ADD requirements.txt /requirements.txt
RUN pip3 install -r ./requirements.txt

RUN export PYTHONIOENCODING=utf-8
RUN export LC_ALL=en_US.UTF-8

ADD backend.py /backend.py
ADD modelo.py /modelo.py
ADD config.py /config.py
ADD inicializa.sh /inicializa.sh

RUN chmod +x /inicializa.sh
ENTRYPOINT ["/inicializa.sh"]