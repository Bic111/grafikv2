This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# Struktura frontendu

```
frontend/
├── app/
│   ├── absences/
│   │   └── page.tsx               # Widok zarządzania nieobecnościami
│   ├── employees/
│   │   └── page.tsx               # Panel pracowników
│   ├── generator/
│   │   └── page.tsx               # Formularz generowania grafiku
│   ├── schedule/
│   │   └── page.tsx               # Kalendarz z drag&drop i zapisem zmian
│   ├── settings/
│   │   └── page.tsx               # Konfiguracja ról i zmian
│   ├── globals.css                # Style globalne (Tailwind + reset)
│   ├── layout.tsx                 # Root layout z nawigacją i fontami
│   └── page.tsx                   # Strona domowa (landing)
├── public/
│   └── ...                        # Statyczne zasoby (grafiki, favikona)
├── eslint.config.mjs              # Konfiguracja ESLint (Next + Tailwind)
├── next.config.ts                 # Ustawienia Next.js (TypeScript + bundler)
├── package.json / package-lock.json
├── tsconfig.json                  # Konfiguracja TypeScript dla app dir
├── postcss.config.mjs             # Tailwind/PostCSS
└── README.md (ten plik)
```

## Technologia

- **Next.js 14** w trybie App Router (TypeScript + SSR/ISR)
- **Tailwind CSS** w `globals.css` z utility klasami
- **ESLint** z presetem `next/core-web-vitals`
- Struktura stron w katalogu `app/`: każda funkcjonalność jako osobny folder z własnym `page.tsx`
- Główne widoki pracują na endpointach backendu (`/api/...`) poprzez `fetch`
You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
