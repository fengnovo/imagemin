FROM node:14-alpine
WORKDIR /work
COPY . /work
RUN yarn config set registry https://registry.npm.taobao.org/
RUN cd /work && yarn install 
EXPOSE 3003