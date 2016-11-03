FROM kadirahq/meteord:base

WORKDIR /opt
RUN curl https://nodejs.org/download/release/v0.10.40/node-v0.10.40-linux-x64.tar.gz -sL  -o node-v0.10.40-linux-x64.tar.gz
RUN tar -xmf  node-v0.10.40-linux-x64.tar.gz
RUN rm node-v0.10.40-linux-x64.tar.gz
RUN ln -sf /opt/node-v0.10.40-linux-x64/bin/node /usr/bin/node
RUN ln -sf /opt/node-v0.10.40-linux-x64/bin/npm  /usr/bin/npm

ADD rocketchat.tar.gz /bundle/
RUN mv /bundle/bundle /built_app

WORKDIR /built_app/programs/server
RUN npm i
RUN npm install bcrypt
RUN rm -rf /bundle
RUN node -v
RUN ls -alh

