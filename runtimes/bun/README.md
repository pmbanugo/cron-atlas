# @cron-atlas/runtime-bun

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run runtime.ts
```

This project was created using `bun init` in bun v1.0.25. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Building with flyctl

- Alpine: `fly deploy --remote-only --dockerfile Dockerfile.alpine --app cronatlas-bun-alpine --build-only --push`
- Slim: `fly deploy --remote-only --dockerfile Dockerfile.slim --app cronatlas-bun-slim --build-only --push`

## Building with docker and pushing to any registry

- Slim image: docker buildx build . -t pmbanugo/cronatlas-bun-slim:amd64 --file ./Dockerfile.slim --push --platform linux/amd64
- Alpine Image: docker buildx build . -t pmbanugo/cronatlas-bun-alpine:amd64 --file ./Dockerfile.alpine --push --platform linux/amd64

## Build image refs
