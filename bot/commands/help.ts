import { SessionResponse } from '../handleCommand.ts';
import { getInvalidCommandResponse } from '../messages/util.ts';
import type { Command, CommandExample } from './command.ts';
import { getAddedCommands, getCommand } from './index.ts';
import { watchCommand } from './watch.ts';

export function formatExamples(examples: Array<CommandExample>) {
  return `Examples:\n ${examples.map(({ usage, result }) => `${usage}\n  ${result}`).join('\n')}`;
}

const formatCommandHelp = (command: Command) => {
  const aliases = command.aliases.map((alias) => `/${alias}`);
  const examples = command.examples ? formatExamples(command.examples) : null;
  return `
/${command.name} - ${command.description}
${aliases?.length ? `Aliases: ${aliases.join(', ')}` : ''}

${examples ? examples : ''}
`;
};

const formatHelpCommand = () => {
  return `
Available commands:

${getAddedCommands()
  .filter((command) => !command.isAdmin)
  .map((command) => `/${command.name} - ${command.description}`)
  .join('\n')}
`;
};

export const helpCommand: Command = {
  name: 'help',
  aliases: ['h'],
  description: 'See all command information or usage information for a specific command.',
  examples: [
    {
      usage: `/help ${watchCommand.name}`,
      result: `Gets the help information for the ${watchCommand.name} command`,
    },
  ],
  isPublic: true,
  handler: async (args) => {
    const commandForHelp = args[0];
    if (commandForHelp) {
      const command = getCommand(commandForHelp);
      if (!command) return new SessionResponse(getInvalidCommandResponse());
      return new SessionResponse(formatCommandHelp(command));
    }

    return new SessionResponse(formatHelpCommand());
  },
};

/**
 * TODO - Investigate if a class based approach for commands works better than with an object. The current glaring annoyance is we can't use this.name inside the examples if its an object
 */
// class HelpCommand implements Command {
//   static readonly isPublic?: boolean = true
//
//   static readonly name: string = 'help'
//   static readonly aliases: Array<string> = ['h']
//   static readonly description: string = 'See all command information or usage information for a specific command.'
//   static readonly examples?: Array<CommandExample> = [
//     {
//       usage: `/help ${watchCommand.name}`,
//       result: `Gets the help information for the ${watchCommand.name} command`,
//     },
//   ]
//
//   static public async handler (args: CommandArgs) {
//     const commandForHelp = args[0];
//     if (commandForHelp) {
//       const command = getCommand(commandForHelp);
//       if (!command) return new SessionResponse(getInvalidCommandResponse());
//       return new SessionResponse(formatCommandHelp(command));
//     }
//
//     return new SessionResponse(formatHelpCommand());
//   }
// }
//
// export const helpCommand = new HelpCommand()
