FROM node:18-alpine

WORKDIR /app/packages/frontend

COPY packages/frontend/package*.json ./
RUN npm install

COPY packages/frontend/ .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"] 