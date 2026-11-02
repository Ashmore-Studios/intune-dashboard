# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
ARG GH_PACKAGES_TOKEN
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc,required=false \
    if [ -n "$GH_PACKAGES_TOKEN" ]; then printf '\n//npm.pkg.github.com/:_authToken=%s\n' "$GH_PACKAGES_TOKEN" >> .npmrc; fi && \
    npm ci && \
    sed -i '/_authToken/d' .npmrc
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
