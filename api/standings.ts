import { handleStandings } from '../server/handlers/standings.js';

export function GET(req: Request): Promise<Response> {
  return handleStandings(req);
}
