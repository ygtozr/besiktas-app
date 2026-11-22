import { handleStandings } from '../server/handlers/standings.js';

export function GET(): Promise<Response> {
  return handleStandings();
}
