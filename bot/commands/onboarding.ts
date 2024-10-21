import { SessionResponse } from '../handleCommand.ts';
import { supportMessageLog } from '../messages/support.ts';
import type { Command } from './command.ts';
import { getOnboardingMessage } from '../messages/onboarding.ts';

export const onboardingCommand: Command = {
  name: 'onboarding',
  aliases: [],
  description: "Get the bot's initial onboarding message.",
  isPublic: true,
  handler: async () => new SessionResponse(getOnboardingMessage()),
};
