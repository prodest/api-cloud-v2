FROM mhart/alpine-node:6

# add project to build
COPY . /root/app
WORKDIR /root/app
RUN npm install && \
    npm run build

ENV PORT 3000

EXPOSE 3000

CMD [ "npm", "start" ]
