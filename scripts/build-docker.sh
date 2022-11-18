#! /bin/bash
set -e

echo "Removing imgaes if any..."
docker rmi -f localhost/details:v1
docker rmi -f localhost/frontend:v1
docker rmi -f localhost/pinger:v1
docker rmi -f localhost/pinger:v2

echo "Building images..."
docker build ./app/details -t localhost/details:v1
docker build ./app/frontend -t localhost/frontend:v1
docker build ./app/pinger/v1 -t localhost/pinger:v1
docker build ./app/pinger/v2 -t localhost/pinger:v2

echo "New images:"
docker images

echo "Loading images to kind..."
kind load docker-image localhost/details:v1 
kind load docker-image localhost/frontend:v1
kind load docker-image localhost/pinger:v1 
kind load docker-image localhost/pinger:v2
