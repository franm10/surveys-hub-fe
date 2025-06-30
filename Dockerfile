# Etapa 1: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production

# Etapa 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist/surveys-hub-fe/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
