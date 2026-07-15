type LogEntry = { time: string; message: string };

const MAX_ENTRIES = 100;
let logs: LogEntry[] = [];

export function addLog(message: string) {
  const time = new Date().toLocaleTimeString();
  logs.push({ time, message });
  if (logs.length > MAX_ENTRIES) logs.shift();
  // On garde aussi le console.warn habituel, utile si un jour tu rebranches adb.
  console.warn(`[${time}] ${message}`);
}

export function getLogsAsText(): string {
  if (logs.length === 0) return '(aucun log pour le moment)';
  return logs.map((l) => `[${l.time}] ${l.message}`).join('\n');
}

export function clearLogs() {
  logs = [];
}