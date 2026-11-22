import { handleFixtures } from '../server/handlers/fixtures.js';

export function GET(): Promise<Response> {
  return handleFixtures();
}
