# Node.js Runtime

- Slim image: docker buildx build . -t pmbanugo/cronatlas-nodejs-slim:amd64 --file ./Dockerfile.slim --push --platform linux/amd64
- Alpine Image: docker buildx build . -t pmbanugo/cronatlas-nodejs-alpine:amd64 --file ./Dockerfile.alpine --push --platform linux/amd64
