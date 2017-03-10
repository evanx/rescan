FROM mhart/alpine-node:latest
ADD package.json .
RUN npm install --silent
ADD lib lib
CMD ["node", "--harmony", "lib/index.js"]
