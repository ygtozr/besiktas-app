import { handleSquad } from '../server/handlers/squad.js';

export function GET(): Promise<Response> {
  return handleSquad();
}
