type LogFields = Record<string, unknown>;

function line(level: string, fields: LogFields): void {
  const payload = JSON.stringify({
    level,
    ts: new Date().toISOString(),
    ...fields,
  });
  if (level === "error") {
    console.error(payload);
  } else {
    console.log(payload);
  }
}

export const logger = {
  info(fields: LogFields): void {
    line("info", fields);
  },
  error(fields: LogFields): void {
    line("error", fields);
  },
};
