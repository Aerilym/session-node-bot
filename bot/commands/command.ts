import type { Message } from '../../types';
import type { SessionResponse } from '../handleCommand.ts';

export type CommandArgs = Array<string>;

export type CommandExample = {
  usage: string;
  result: string;
};

export interface Command {
  readonly aliases: Array<string>;
  readonly description: string;
  readonly examples?: Array<CommandExample>;
  readonly handler: (args: CommandArgs, msg: Message) => Promise<SessionResponse>;
  readonly name: string;
  readonly isPublic?: boolean;
}

export const splitCommand = (text: string): { name: string; args: CommandArgs } => {
  const [command, ...args] = text.trim().split(' ');
  return { name: command.substring(1), args };
};
