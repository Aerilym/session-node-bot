import { color } from 'bun' with { type: 'macro' };
import { SessionLog } from './sessionLog.ts';
import { initTimedLogger } from './timedLog.ts';
import { LOG_LEVEL } from './types.ts';
import {
  DEBUG,
  SESSION_REMOTE_LOG_ADDRESS,
  SESSION_REMOTE_LOG_ADDRESS_ERROR,
  SESSION_REMOTE_LOG_PREFIX,
  SESSION_REMOTE_LOG_PREFIX_ERROR,
} from '../env.ts';
import { FileLog } from './fileLog.ts';

function getColorForLevel(level: LOG_LEVEL) {
  switch (level) {
    case LOG_LEVEL.DEBUG:
      return color('cyan', 'ansi');
    case LOG_LEVEL.INFO:
      return color('white', 'ansi');
    case LOG_LEVEL.WARN:
      return color('yellow', 'ansi');
    case LOG_LEVEL.ERROR:
      return color('red', 'ansi');
  }
}

function getLevelName(level: LOG_LEVEL) {
  switch (level) {
    case LOG_LEVEL.DEBUG:
      return 'DBUG';
    case LOG_LEVEL.INFO:
      return 'INFO';
    case LOG_LEVEL.WARN:
      return 'WARN';
    case LOG_LEVEL.ERROR:
      return 'EROR';
  }
}

const getLogDate = () => new Date().toISOString().substring(0, 19).replace('T', ' ');

const formatLog = (level: LOG_LEVEL, args: Array<unknown>) => {
  args.unshift(`[${getLogDate()}]`);
  args.unshift(`${getColorForLevel(level)}[${getLevelName(level)}]`);
  return args;
};

const basicLogs = {
  debug: DEBUG
    ? (...args: Array<unknown>) => console.debug(...formatLog(LOG_LEVEL.DEBUG, args))
    : () => null,
  info: (...args: Array<unknown>) => console.info(...formatLog(LOG_LEVEL.INFO, args)),
  warn: (...args: Array<unknown>) => console.warn(...formatLog(LOG_LEVEL.WARN, args)),
  error: (...args: Array<unknown>) => console.error(...formatLog(LOG_LEVEL.ERROR, args)),
};

const sessionLogInfo = new SessionLog({
  internalLogger: basicLogs,
  template: (text: string) => `${SESSION_REMOTE_LOG_PREFIX} [${getLogDate()}] ${text}`,
  sessionId: SESSION_REMOTE_LOG_ADDRESS,
});

const sessionLogError = new SessionLog({
  internalLogger: basicLogs,
  template: (text: string) => `${SESSION_REMOTE_LOG_PREFIX_ERROR} [${getLogDate()}] ${text}`,
  sessionId: SESSION_REMOTE_LOG_ADDRESS_ERROR,
});

const fileLogOut = new FileLog({
  fileName: 'log-out.log',
  internalLogger: basicLogs,
  highWaterMark: 1024,
});

const fileLogError = new FileLog({
  fileName: 'log-error.log',
  internalLogger: basicLogs,
  highWaterMark: 1024,
});

export const log = {
  timed: initTimedLogger(basicLogs),
  debug: basicLogs.debug,
  info: (...args: Array<unknown>) => {
    basicLogs.info(...args);
    fileLogOut.write(...args);
  },
  warn: (...args: Array<unknown>) => {
    basicLogs.warn(...args);
    fileLogOut.write(...args);
  },
  error: (err: Error | string, ...args: Array<unknown>) => {
    const msg = typeof err === 'string' ? err : 'message' in err ? err.message : '';
    const stack = typeof err !== 'string' && 'stack' in err ? (err.stack ?? '') : '';

    basicLogs.error(...args, msg, stack);
    fileLogError.write(...args);
    sessionLogError.write(...args, msg, stack);
  },
  remote: (...args: Array<unknown>) => {
    basicLogs.info(...args);
    fileLogOut.write(...args);
    sessionLogInfo.write(...args);
  },
  remoteFlush: async () => {
    fileLogOut.flush();
    await sessionLogInfo.flush();
  },
};
