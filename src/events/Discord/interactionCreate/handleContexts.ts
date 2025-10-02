import { Interaction } from "discord.js";
import { getContextObject } from "../../../preloaded";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkPermission from "../../../validator/checkPermission";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { UserInteractionCooldown } from "../../../classes/UserInteractionCooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  if (!interaction.isContextMenuCommand()) return;

  try {
    const contextObject = getContextObject(interaction.commandName);

    if (!contextObject) return;

    if (!contextObject.useInDm)
      if (!interaction.guild) {
        return interaction.user.send({
          embeds: [
            CommonEmbedBuilder.error({
              title: "Can't Use In Dm",
              description: "This command can't be used in DMs.",
            }),
          ],
        });
      }

    if (contextObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This context menu is for developers only.",
          type: "warning",
        });
    }

    const userCooldown = new UserInteractionCooldown(interaction.user.id);

    if (contextObject.cooldown) {
      const cooldownResponse = userCooldown.isCooledDown(
        interaction.commandName,
        "context",
        contextObject.cooldown
      );

      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this context menu again.`,
          type: "warning",
        });
    }

    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild.members.me?.permissions,
        contextObject.botPermissionsRequired,
        contextObject.userPermissionsRequired
      );
    }

    const succeed = (await contextObject.execute(interaction, client)) ?? true;
    if (succeed && contextObject.cooldown) userCooldown.updateCooldown();
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Context Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    handleInteractionError(interaction, error, true);
  }
};

export default event;
