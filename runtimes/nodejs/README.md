# Node.js Runtime

## Building with flyctl

- Alpine: `fly deploy --remote-only --dockerfile Dockerfile.alpine --app cronatlas-nodejs-alpine --build-only --push`
- Slim: `fly deploy --remote-only --dockerfile Dockerfile.slim --app cronatlas-nodejs-slim --build-only --push`

## Building with docker and pushing to any registry

- Slim image: docker buildx build . -t pmbanugo/cronatlas-nodejs-slim:amd64 --file ./Dockerfile.slim --push --platform linux/amd64
- Alpine Image: docker buildx build . -t pmbanugo/cronatlas-nodejs-alpine:amd64 --file ./Dockerfile.alpine --push --platform linux/amd64

## Build image refs
