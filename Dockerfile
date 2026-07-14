# FEI static website — no build step, just served by nginx.
FROM nginx:alpine

# Custom server config: serve a branded /404.html on not-found (it beacons the
# missing URL to the 404 tracker workflow).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the site into nginx's web root.
# Exclusions (docs/, .claude/, .git/, etc.) are handled by .dockerignore.
COPY . /usr/share/nginx/html

# nginx:alpine already EXPOSEs 80 and runs nginx in the foreground.
