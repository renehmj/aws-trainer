# Self-contained image with the app baked in — for deploying somewhere else
# later. For local study use docker-compose.yml instead, which bind-mounts the
# files so question edits go live on refresh with no rebuild.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html questions.js /usr/share/nginx/html/

EXPOSE 80
