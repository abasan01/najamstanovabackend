FROM node:alpine
WORKDIR /src
COPY package*.json .
RUN npm ci
COPY . .
#CMD ["npm", "start"]
CMD ["npm", "run", "serve"]