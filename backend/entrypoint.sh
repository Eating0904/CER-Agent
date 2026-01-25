#!/bin/bash

# logs
if [ ! -d "logs" ]; then
    mkdir logs
    chmod -R 777 logs
fi

# migrate
python manage.py migrate --noinput

# collectstatic
python manage.py collectstatic --noinput

# run
gunicorn --access-logfile - \
    --workers 4 \
    --bind 0.0.0.0:8000 \
    -k uvicorn.workers.UvicornWorker \
    config.asgi:application
