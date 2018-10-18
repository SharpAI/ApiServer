FROM lambdazhang/meteor:1.6-base
ADD ./rt-portal.tar.gz /bundle/
RUN mv /bundle/bundle /built_app
RUN ls /built_app -lah
WORKDIR /built_app/programs/server
RUN ls -lah
RUN npm install --unsafe-perm
#RUN npm install bcrypt@0.8.7
RUN rm -rf /bundle
RUN node -v
RUN ls -alh
