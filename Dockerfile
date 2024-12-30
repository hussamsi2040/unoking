FROM node:18-alpine as base
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/
RUN npm install

FROM base as shared
WORKDIR /app/packages/shared
COPY packages/shared/ .
CMD ["npm", "run", "build", "--", "--watch"]

FROM base as backend
WORKDIR /app/packages/backend
COPY packages/backend/ .
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM base as frontend
WORKDIR /app/packages/frontend
COPY packages/frontend/ .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"] 