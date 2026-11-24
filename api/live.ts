import { handleLive } from '../server/handlers/live.js';

export function GET(): Promise<Response> {
  return handleLive();
}
