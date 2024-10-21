// Improved from github.com/oxen-io/websites/ TODO - import from the package once its released

import { LOG_LEVEL, type Logger } from './types.ts';

/**
 * Format a millisecond value to a seconds string
 * @param milliseconds the time value in milliseconds
 * @return the seconds value as a string
 */
function formatMillisecondsToSeconds(milliseconds: number): string {
  return (milliseconds / 1000).toString();
}

/**
 * Create a new TimedLog instance. A logging method can be called later to log a message with an elapsed time.
 *
 * When an instance of this class is created it will save the current time in itself and use that time to compute the elapsed time when a logging method is called on it.
 *
 * @example
 * const timedLog = new TimedLog();
 * timedLog.debug('A message was sent with id 7');
 * // Output: A message was sent with id 7: 1.923s
 *
 * @example
 * const timedLog = new TimedLog();
 * timedLog.debug('A message was sent after {time} with id 7');
 * // Output: A message was sent after 1.923s with id 7
 */
export class TimedLog {
  private start: number = Date.now();
  private readonly logger: Logger;

  private static timeAppendPrefix = ':';
  private static millisecondSuffix = 'ms';
  private static secondSuffix = 's';

  constructor(
    logger: Logger,
    initialMessage?: Array<unknown>,
    initialLogLevel: LOG_LEVEL = LOG_LEVEL.INFO,
  ) {
    this.logger = logger;

    if (initialMessage) {
      this.logger[initialLogLevel](...initialMessage);
    }
  }

  /**
   * Reset the timer to the current time.
   *
   * @example
   * const timedLog = new TimedLog();
   * timedLog.debug('A message was sent with id 7');
   * // Output: A message was sent with id 7: 1.923s
   * timedLog.resetTimer();
   * timedLog.debug('A message was sent with id 8');
   * // Output: A message was sent with id 8: 2.318s
   */
  public resetTimer() {
    this.start = Date.now();
  }

  /**
   * The timed log's current elapsed time.
   */
  public get elapsedTime() {
    return Date.now() - this.start;
  }

  /**
   * Format the time elapsed since the start of the timer.
   * @param time The time to format.
   * @returns The formatted time.
   */
  public static formatDistanceToNow(time: number) {
    const ms = Date.now() - time;

    if (ms < 1000) {
      return `${ms}${TimedLog.millisecondSuffix}`;
    }

    return `${formatMillisecondsToSeconds(ms)}${TimedLog.secondSuffix}`;
  }

  /**
   * Log a message at the given level.
   *
   * @param level The level to log at.
   * @param data The message to log.
   *
   * @example Basic Usage
   * const timedLog = initTimedLog(console.log);
   * timedLog.log(LOG_LEVEL.DEBUG, 'A message was sent with id 7');
   * // Output: A message was sent with id 7: 1.923s
   */
  public log(level: LOG_LEVEL, ...data: Array<unknown>): void {
    data.push(TimedLog.timeAppendPrefix);
    data.push(TimedLog.formatDistanceToNow(this.start));
    this.logger[level](...data);
  }
}

function initTimedLog(logger: Logger, data: Array<unknown>, level: LOG_LEVEL) {
  const timedLog = new TimedLog(logger, data, level);
  return {
    end: (...data: Array<unknown>) => timedLog.log(level, ...data),
    time: () => timedLog.elapsedTime,
  };
}

/**
 * Create a new TimedLog instance. This can be called later to log a message with an elapsed time.
 * @param logger A Logger
 */
export const initTimedLogger = (logger: Logger) => {
  return {
    debug: (...data: Array<unknown>) => initTimedLog(logger, data, LOG_LEVEL.DEBUG),
    info: (...data: Array<unknown>) => initTimedLog(logger, data, LOG_LEVEL.INFO),
    warn: (...data: Array<unknown>) => initTimedLog(logger, data, LOG_LEVEL.WARN),
    error: (...data: Array<unknown>) => initTimedLog(logger, data, LOG_LEVEL.ERROR),
  };
};
