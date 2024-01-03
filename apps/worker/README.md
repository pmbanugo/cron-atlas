# Worker App

To start the worker app in watch mode, run:

```bash
pnpm run "/^(build:watch|start:dev)$/"
```

If you're running from the root workspace, then use:

```bash
pnpm run --filter worker "/^(build:watch|start:dev)$/"
```

That will run both the build:watch and start:dev commands simultaneously. Alternatively, you can run those commands one after the other.
