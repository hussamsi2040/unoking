FROM node:18-alpine

WORKDIR /app/packages/shared

COPY packages/shared/package*.json ./
RUN npm install

COPY packages/shared/ .

CMD ["npm", "run", "build", "--", "--watch"] 