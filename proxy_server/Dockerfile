FROM node:latest

WORKDIR /app/proxy_server

COPY './package.json' .

RUN npm install 

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]