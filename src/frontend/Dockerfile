FROM node:20-alpine as frontend-deps

WORKDIR /home/frontend/

COPY ./src/frontend/package.json ./package.json
COPY ./src/frontend/package-lock.json ./package-lock.json

RUN npm ci

COPY .dockerignore ./.dockerignore
COPY ./src/frontend/ .

### ---- Front-end builder image ----
FROM frontend-deps as meet

WORKDIR /home/frontend

FROM frontend-deps as meet-dev

WORKDIR /home/frontend

EXPOSE 3000

CMD [ "npm", "run", "dev"]

# Tilt will rebuild Meet target so, we dissociate meet and meet-builder
# to avoid rebuilding the app at every changes.
FROM meet as meet-builder

WORKDIR /home/frontend

RUN npm run build

# ---- Front-end image ----
FROM nginxinc/nginx-unprivileged:1.25 as frontend-production

# Un-privileged user running the application
ARG DOCKER_USER
USER ${DOCKER_USER}

COPY --from=meet-builder \
    /home/frontend/dist \
    /usr/share/nginx/html

COPY ./src/frontend/default.conf /etc/nginx/conf.d
COPY ./docker/files/usr/local/bin/entrypoint /usr/local/bin/entrypoint

ENTRYPOINT [ "/usr/local/bin/entrypoint" ]

CMD ["nginx", "-g", "daemon off;"]
