image='uswccr.ccs.tencentyun.com/shangao/coordinator:v0.0.6'
docker buildx build --platform linux/amd64 -f Dockerfile -t ${image} --push .


# docker rm -f coordinator \
#   && docker run -d -p 8081:8081 --name coordinator ${image}
