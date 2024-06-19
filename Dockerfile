FROM node:20.12.2-bookworm-slim
COPY . /app
EXPOSE 8081
WORKDIR /app/
CMD /app/entrypoint.sh
