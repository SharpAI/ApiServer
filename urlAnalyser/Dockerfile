FROM node:latest

RUN apt-get update -y && apt-get install -y \
    python2.7 python-pip \
    libfreetype6 libfontconfig libgtk2.0-0 libnotify4 libgconf2-4 libnss3-1d libxss1 libasound2 xvfb

RUN apt-get -y autoremove
RUN apt-get -y clean

EXPOSE 8080

ADD ./package.json /data/package.json
RUN cd /data && npm install

ADD . /datatmp/
RUN rm -rf /datatmp/node_modules /datatmp/assets
RUN mv /datatmp/* /data/
WORKDIR /data/

CMD xvfb-run npm start
