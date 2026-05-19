root/
├── apps/
│   ├── web-app/             # Vite + React application
│   │   ├── package.json
│   │   └── vite.config.ts
├── packages/
│   ├── ui/                  # Shared UI component library
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts   # Configured for "Library Mode"
│   ├── utils/               # Shared logic and helpers
│   │   ├── package.json
│   │   └── tsconfig.json
├── package.json             # Root config defining workspaces
├── tsconfig.base.json       # Shared TypeScript base config
└── node_modules/    
