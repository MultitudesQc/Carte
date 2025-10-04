This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It is set up to export static files with `output: 'export'`.

## Development

```bash
npm run dev
```

## Deployment

```bash
npm run build
```

## Environment Variables

Local development uses the `.env.development.local` file, which is ignored by Git. You can make your own based on the `env.example`. It will be used to provide the code with the correct API url.

For production, running `npm run build` will use `.env` instead, so put your production url there.

Once the build is complete, you can find the static files in the `out` directory. Parts of these files can be copy-pasted into custom HTML blocks on the target website, but these instructions remain to be tested so they might change in the future.