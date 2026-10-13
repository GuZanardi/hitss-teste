This folder contains the React Native CLI mobile application written in TypeScript.

## Project conventions

- Use React Navigation for screen navigation and keep each screen in its own folder with `index.tsx`, `types.ts`, and a screen-specific `service.ts` where appropriate.
- Use React Hook Form with Zod for form validation and React Query for API server state.
- Keep API URLs and credentials in `.env`; commit `.env.example`, never local environment files.
- Use NativeWind for styling and follow the dark Claro Tasks palette already defined in `tailwind.config.js`.
- Keep reusable UI components in `src/components`, shared API clients/services in `src/services`, and domain types in `src/types`.

## Commands

Run commands from this directory:

```bash
npm start
npm test -- --runInBand
npx tsc --noEmit
npm run android
npm run ios
```

The native Android and iOS projects live in `android/` and `ios/`. Use the React Native CLI for platform builds and keep native configuration in those projects.
