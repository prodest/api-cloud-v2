#!/bin/bash

docker tag $DOCKER_IMAGE $DOCKER_IMAGE:$TRAVIS_BRANCH

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker push $DOCKER_IMAGE
