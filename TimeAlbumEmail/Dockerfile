FROM kadirahq/meteord:base
ADD ./TimeAlbumEmail.tar.gz /bundle/
RUN mv /bundle/bundle /built_app
WORKDIR /built_app/programs/server
RUN npm i
RUN npm install bcrypt@0.8.7
RUN rm -rf /bundle
RUN node -v
RUN ls -alh
