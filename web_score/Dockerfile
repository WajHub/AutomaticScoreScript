FROM node:latest

WORKDIR /app/web_score

COPY ./package.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]