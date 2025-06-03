FROM node:18-alpine

WORKDIR /app

RUN apk --no-cache add curl

COPY package.json ./

RUN npm install

COPY . ./

# Expose port 9021
EXPOSE 9021

CMD ["npm", "run", "start"]
