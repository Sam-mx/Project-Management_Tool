FROM node:18-alpine

WORKDIR /server

COPY package.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
