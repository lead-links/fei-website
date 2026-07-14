# FEI website — build the Astro app, then serve the static output with nginx.

# ---- Build stage: compile the Astro site to /app/dist ----
FROM node:22-alpine AS build
WORKDIR /app
COPY astro/package.json astro/package-lock.json ./
RUN npm ci
COPY astro/ ./
RUN npm run build

# ---- Serve stage: nginx serves the static build ----
FROM nginx:alpine
# Custom server config: clean URLs + branded /404.html (its inline script beacons
# the missing URL to the 404 tracker workflow).
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Only the built static site goes into the image (not the source or node_modules).
COPY --from=build /app/dist /usr/share/nginx/html

# nginx:alpine already EXPOSEs 80 and runs nginx in the foreground.
