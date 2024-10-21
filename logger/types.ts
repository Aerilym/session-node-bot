export enum LOG_LEVEL {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export type Logger = Record<LOG_LEVEL, LogFunction>;
export type LogFunction = (...args: Array<unknown>) => unknown;

export interface Pipe {
  readonly buffer: ArrayLike<unknown>;
  readonly highWaterMark: number;
  readonly destination: string;
  write(...data: Array<unknown>): number;
  flush(): number | Promise<number>;

  // Optional Implementations
  log?: Logger;
}
