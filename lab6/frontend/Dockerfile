FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG ORIGIN=http://localhost:3000
RUN ORIGIN=$ORIGIN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY --from=build /app/build build
ENV PORT=3000
EXPOSE 3000
CMD ["node", "build"]
