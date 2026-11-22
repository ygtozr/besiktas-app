import { handleUsage } from '../server/handlers/usage.js';

export function GET(): Promise<Response> {
  return handleUsage();
}
