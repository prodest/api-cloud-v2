#!/bin/bash

docker build -t $DOCKER_IMAGE .
echo 'Branch atual'
echo $TRAVIS_BRANCH