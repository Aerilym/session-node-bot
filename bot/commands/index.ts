import { log } from '../../logger';
import type { Command } from './command.ts';

const addedCommands: Array<Command> = [];

export function getAddedCommands() {
  return addedCommands;
}

const commands = new Map<string, Command>();

export function getCommand(name: string): Command | undefined {
  return commands.get(name);
}

function addCommand(name: string, command: Command) {
  if (commands.has(name)) {
    throw new Error(`Command ${name} is already registered`);
  }
  log.debug('Adding command: ', name);
  commands.set(name, command);
}

export function registerCommand(command: Command) {
  addCommand(command.name, command);
  addedCommands.push(command);
  for (const alias of command.aliases) {
    addCommand(alias, command);
  }
}
