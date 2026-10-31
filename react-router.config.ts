import type { Config } from "@react-router/dev/config";

export default {
  appDirectory: "frontend/app",
  ssr: true,
  splitRouteModules: false,
  routeDiscovery: { mode: "initial" },
} satisfies Config;
