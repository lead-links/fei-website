# FEI static website — no build step, just served by nginx.
FROM nginx:alpine

# Copy the site into nginx's web root.
# Exclusions (docs/, .claude/, .git/, etc.) are handled by .dockerignore.
COPY . /usr/share/nginx/html

# nginx:alpine already EXPOSEs 80 and runs nginx in the foreground.
