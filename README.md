# PT Magic ✨

PT Magic is a powerful web application designed to analyze and visualize Provisioned Throughput (PT) and burst bucket dynamics for AI models. It allows users to input various configurations and see how different models and parameters affect performance and capacity.

## 🚀 Features

- **Provisioned Throughput Calculation**: Accurately calculates PT based on model, GSU count, and token configurations.
- **Burst Bucket Simulation**: Visualizes how burst buckets behave under different traffic patterns, including rush hour scenarios and peak bursts.
- **Rush Hour Analysis**: Simulates traffic increases minute-by-minute to show how long the burst bucket can sustain overage and when it might fail.
- **Peak Hour Burst Modeling**: Models a typical hour with a baseline load plus a simulated peak user arriving and consuming resources.
- **Configurable Parameters**: Allows users to adjust model, GSU count, token usage, agent patterns, and site-specific traffic to see real-time impacts.
- **Data Visualization**: Presents complex calculations in clear, understandable tables and charts.
- **Dockerized Deployment**: Includes Docker and Docker Compose configurations for easy deployment.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend/Utilities**: Node.js, TypeScript, Deno (for socket example)
- **Build Tools**: Vite, SWC, esbuild
- **Linting/Formatting**: ESLint, Prettier
- **Containerization**: Docker

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/captainjspace/ptmagic.git
    cd ptmagic
    ```

2.  **Install dependencies using pnpm:**
    ```bash
    pnpm install
    ```

3.  **Build the project:**
    ```bash
    pnpm run build
    ```

4.  **Run the application locally:**
    ```bash
    pnpm run dev
    ```

    This will start the development server, usually at `http://localhost:5173/`.

5.  **Using Docker:**
    If you have Docker and Docker Compose installed, you can build and run the application using:
    ```bash
    docker-compose up --build
    ```
    The application will be accessible at `http://localhost:8080/`.

## 💡 Usage

PT Magic provides a web interface to explore the performance characteristics of various AI models under different load conditions. 

### Key Sections:

1.  **Configuration Form**: Adjust parameters like Model, GSU Count, Prompt Tokens, Context Tokens, Turns per Minute, etc., to tailor the calculations.
2.  **Metric Explorer**: Displays a detailed breakdown of calculated metrics, including baseline capacity, burndown tokens, expected output token costs, and average minute burn.
3.  **Rush Hour Analysis**: Simulates a scenario where users increase minute by minute, showing the impact on the token bucket's reserve, accumulated debt, and overall status. This helps understand how long the system can sustain increased load.
4.  **Burst Performance**: Allows you to adjust steady-state users and sudden burst users to observe real-time metrics like Steady State TPS, Peak Spike TPS, Time to Failure, and Recovery Capacity.

### Example Workflow:

1.  Open the application in your browser.
2.  Use the **Configuration Form** to select a model (e.g., Gemini 3.1 Flash) and adjust settings like `GSU Count` or `Prompt Tokens`.
3.  Observe the **Metric Explorer** to see how these changes affect baseline capacity and token burn rates.
4.  Navigate to the **Rush Hour Analysis** tab to see how the system handles a gradual increase in users.
5.  Switch to **Burst Performance** to simulate sudden spikes in traffic and understand the system's resilience and recovery.

## 📂 Project Structure

```
ptmagic/
├── Dockerfile
├── docker-compose.yml
├── apps/pt-magic/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── ConfigForm.tsx
│   │   ├── DataDisplayComponent.tsx
│   │   ├── Headline.tsx
│   │   ├── RushHourTable.tsx
│   │   └── TokenSimulator.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── packages/
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── schema-gen/
│   ├── socket/
│   └── utils/
│       ├── src/
│       │   ├── ErrorCodes.ts
│       │   ├── flattenObject.ts
│       │   ├── GSUmodels.ts
│       │   ├── index.ts
│       │   ├── RushHourCalc.ts
│       │   ├── SiteModel.ts
│       │   ├── TokenCalculatorConfig.ts
│       │   ├── TokenCruncher.ts
│       │   └── UserCapacityCalcs.ts
│       ├── package.json
│       └── tsconfig.json
├── tsconfig.json
├── package.json
└── ... (other configuration and script files)
```

## 📚 Dependencies

- **Core**: React, React-DOM, React Icons
- **Utilities**: `@ptcalc/utils` (local workspace dependency)
- **Build & Dev**: Vite, TypeScript, Tailwind CSS, ESLint, Prettier, SWC, ts-node, ts-json-schema-generator, Ajv, json-schema-to-ts
- **Testing**: Not explicitly found, but linting configurations are robust.
- **Node.js**: For backend logic and scripting.
- **Deno**: Utilized in `packages/socket/src/server.ts` for demonstrating a Unix socket server.

## 📜 Scripts

- `pnpm run dev`: Starts the development server for `apps/pt-magic`.
- `pnpm run build`: Builds all packages and the main application.
- `pnpm run lint`: Runs ESLint across the entire project.
- `pnpm run format`: Formats code using Prettier.
- `pnpm run ci`: Cleans, installs, and builds the project (suitable for CI).
- `pnpm --filter @ptcalc/utils calc`: Runs the utility package's calculation script.
- `pnpm --filter @ptcalc/pt-magic preview`: Previews the built application.

## 🤝 Contributing

Contributions are welcome! Please feel free to:

- Fork the repository.
- Create a new branch (`git checkout -b feature/your-feature`).
- Make your changes and commit them (`git commit -am 'Add your feature'`).
- Push to the branch (`git push origin feature/your-feature`).
- Open a Pull Request.

Please ensure your code adheres to the project's linting and formatting standards.

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🔗 Important Links

- **Repository**: [captainjspace/ptmagic](https://github.com/captainjspace/ptmagic)

## © Footer

Made with ❤️ by [captainjspace](https://github.com/captainjspace)

Star ⭐, Fork 🍴, and Contribute 🚀 to the [ptmagic repository](https://github.com/captainjspace/ptmagic)!


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**