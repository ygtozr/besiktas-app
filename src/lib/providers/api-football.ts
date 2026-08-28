import type { FootballDataProvider } from "../types";

export const apiFootballProvider: FootballDataProvider = {
  async getData() {
    const key = process.env.API_FOOTBALL_KEY;
    if (!key) throw new Error("API_FOOTBALL_KEY tanımlı değil.");

    // Sağlayıcı yanıtları burada uygulamanın ortak veri modeline dönüştürülecek.
    // Kapsam doğrulaması tamamlanana kadar canlı mod bilinçli olarak etkin değildir.
    throw new Error("API-Football canlı kapsam doğrulaması bekleniyor.");
  },
};
