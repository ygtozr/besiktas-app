import { handleMatch } from '../server/handlers/match.js';

export function GET(req: Request): Promise<Response> {
  return handleMatch(req);
}
