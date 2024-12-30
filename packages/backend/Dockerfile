FROM node:18-alpine

WORKDIR /app/packages/backend

COPY packages/backend/package*.json ./
RUN npm install

COPY packages/backend/ .

EXPOSE 4000
CMD ["npm", "run", "dev"] 