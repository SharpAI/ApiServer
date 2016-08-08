FROM node:latest

RUN apt-get update -y && apt-get install -y \
    python2.7 python-pip \
    libfreetype6 libfontconfig libgtk2.0-0 libnotify4 libgconf2-4 libnss3-1d libxss1 libasound2 xvfb x11vnc vim

RUN apt-get -y autoremove
RUN apt-get -y clean

EXPOSE 8080 5900
RUN mkdir ~/.vnc
RUN x11vnc -storepasswd we3d24ar ~/.vnc/passwd

RUN mkdir -p /root/.electron/
#ADD electron-v1.2.6-linux-x64.zip /root/.electron/
RUN npm install -g electron-prebuilt@1.2.6

RUN mkdir -p /srv/
RUN cd /srv/ && npm install --registry=https://registry.npm.taobao.org

COPY ./package.json /srv/package.json
COPY ./bundle.js /srv/
COPY ./main_cluster.js /srv/main_cluster.js
COPY ./file_downupload.js /srv/file_downupload.js
COPY ./post_drafts.js /srv/post_drafts.js
COPY ./format-pub.js /srv/format-pub.js
COPY ./start.sh /srv/start.sh
RUN chmod +x /srv/start.sh
WORKDIR /srv/
RUN npm install --production

COPY ./assets/patchs-nightmare-2.5.2/runner.js /srv/node_modules/nightmare/lib/runner.js

#RUN bash -c 'echo "cd /data && npm start" >> /.bashrc'
#CMD x11vnc -forever -usepw -create
CMD xvfb-run --auto-servernum --server-args="-screen 0 1280x760x24"  /srv/start.sh
