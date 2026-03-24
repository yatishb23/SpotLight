This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API proxy setup

The frontend now calls only Next.js API routes (`/api/*`).
Next.js API routes proxy requests to Spring Boot services using environment variables.

Set these values in `.env.local`:

```bash
API_GATEWAY_URL="http://localhost:1111"
AUTH_SERVICE_URL="http://localhost:1111"
EVENT_SERVICE_URL="http://localhost:2222"
USER_SERVICE_URL="http://localhost:1111"
BOOKING_SERVICE_URL="http://localhost:1111"
PAYMENT_SERVICE_URL="http://localhost:1111"
NOTIFICATION_SERVICE_URL="http://localhost:1111"
NEXT_PUBLIC_API_BASE_URL=""
```

`NEXT_PUBLIC_API_BASE_URL` should stay empty for same-origin calls so the browser always uses Next.js `/api/*` routes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
