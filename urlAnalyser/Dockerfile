FROM node:latest

RUN apt-get update -y && apt-get install -y \
    python2.7 python-pip \
    libfreetype6 libfontconfig libgtk2.0-0 libnotify4 libgconf2-4 libnss3-1d libxss1 libasound2 xvfb x11vnc

RUN apt-get -y autoremove
RUN apt-get -y clean

EXPOSE 8080 5900
RUN mkdir ~/.vnc
RUN x11vnc -storepasswd 1234 ~/.vnc/passwd
RUN rm -f /data/package.json
ADD ./package.json /data/package.json
RUN mkdir -p /root/.electron/
ADD assets/monit/electron-v1.2.6-linux-x64.zip /root/.electron/
RUN cd /data && npm install --registry=https://registry.npm.taobao.org

ADD . /datatmp/
RUN rm -rf /datatmp/node_modules /datatmp/assets
RUN mv /datatmp/* /data/
WORKDIR /data/
#RUN bash -c 'echo "cd /data && npm start" >> /.bashrc'
#CMD x11vnc -forever -usepw -create
CMD xvfb-run --auto-servernum --server-args="-screen 0 1280x760x24"  npm start
