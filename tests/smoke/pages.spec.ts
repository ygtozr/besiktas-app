import { expect, test } from "@playwright/test";

for (const [path, title] of [
  ["/", "Sıradaki maç"],
  ["/fikstur", "Sezon fikstürü"],
  ["/kadro", "Takım kadrosu"],
  ["/performans", "Performans paneli"],
] as const) {
  test(`${title} sayfası açılır`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("Demo veri").first()).toBeVisible();
  });
}
