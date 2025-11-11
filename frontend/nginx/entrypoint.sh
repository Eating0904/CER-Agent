#!/bin/bash

envsubst '${API_SERVER} ${MEDIA_SERVER}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -g 'daemon off;'
