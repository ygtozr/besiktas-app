import { demoData } from "../demo-data";
import type { FootballDataProvider } from "../types";

export const demoProvider: FootballDataProvider = {
  async getData() {
    return demoData;
  },
};
