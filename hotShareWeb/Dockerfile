FROM kadirahq/meteord:base
ADD hotShareWeb.tar.gz /bundle/
RUN mv /bundle/bundle /built_app
WORKDIR /built_app/programs/server
RUN npm i
RUN rm -rf /bundle
RUN node -v
RUN ls -alh

