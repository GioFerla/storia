FROM nginx:alpine

# Copia la configurazione nginx personalizzata
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia il sito nella root di nginx
COPY memoria-cernusco.html /usr/share/nginx/html/index.html
COPY documenti /usr/share/nginx/html/documenti
# Compatibilità con eventuali HTML in cache che puntano ancora a /logo.svg
COPY logo.svg /usr/share/nginx/html/logo.svg

EXPOSE 8090

CMD ["nginx", "-g", "daemon off;"]
