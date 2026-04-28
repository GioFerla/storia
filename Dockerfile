FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY style.css /usr/share/nginx/html/style.css
COPY main.js /usr/share/nginx/html/main.js

RUN sed -i 's/listen       80;/listen       8090;/' /etc/nginx/conf.d/default.conf

EXPOSE 8090

CMD ["nginx", "-g", "daemon off;"]
