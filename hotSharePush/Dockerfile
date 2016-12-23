FROM node:7

RUN apt-get update -y
#RUN apt-get install -y \
#    python2.7 python-pip \
#    libfreetype6 libfontconfig libgtk2.0-0 libnotify4 libgconf2-4 libnss3-1d libxss1 libasound2 xvfb x11vnc 
RUN apt-get install -y vim

RUN apt-get -y autoremove
RUN apt-get -y clean

EXPOSE 80
RUN mkdir ~/.vnc
#RUN x11vnc -storepasswd we3d24ar ~/.vnc/passwd

RUN mkdir -p /srv/
RUN cd /srv/ && npm install --registry=https://registry.npm.taobao.org

COPY ./package.json /srv/package.json
COPY ./*.js /srv/
ADD ./private/ /srv/private
RUN ls -la /srv/private
RUN ls -la /srv/private/ios
COPY ./start.sh /srv/start.sh

RUN chmod +x /srv/start.sh
WORKDIR /srv/
RUN npm install --production

#CMD xvfb-run --auto-servernum --server-args="-screen 0 1280x760x24"  /srv/start.sh
CMD /srv/start.sh
