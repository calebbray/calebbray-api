FROM node:lts-alpine

RUN addgroup -S appGroup
RUN adduser -S -g appGroup appGroupUser
USER appGroupUser

RUN mkdir -p /home/appGroupUser/app
WORKDIR /home/appGroupUser/app
COPY . /home/appGroupUser
RUN npm i --quiet
EXPOSE 5000
CMD ["serverless", "offline", "start"]
