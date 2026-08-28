import { demoProvider } from "./providers/demo";
import { apiFootballProvider } from "./providers/api-football";
import type { FootballData, FootballDataProvider } from "./types";

function selectedProvider(): FootballDataProvider {
  return process.env.FOOTBALL_DATA_PROVIDER === "api-football"
    ? apiFootballProvider
    : demoProvider;
}

export async function getFootballData(): Promise<FootballData> {
  try {
    return await selectedProvider().getData();
  } catch {
    return { ...(await demoProvider.getData()), stale: true };
  }
}

export function getServerNow() {
  return Date.now();
}
