import { Interaction } from "discord.js";
import { getExactCommandObject } from "../../../preloaded";
import checkPermission from "../../../validator/checkPermission";
import { CustomError } from "../../../helpers/utils/CustomError";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../../helpers/embeds/commonEmbedBuilder";
import { UserInteractionCooldown } from "../../../classes/UserInteractionCooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const commandObject = getExactCommandObject(interaction.commandName);

    if (!commandObject) return;

    if (!commandObject.useInDm)
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

    if (commandObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This command is for developers only.",
          type: "warning",
        });
    }

    let userCooldown = new UserInteractionCooldown(interaction.user.id);

    if (commandObject.cooldown) {
      const cooldownResponse = userCooldown.isCooledDown(
        interaction.commandName,
        "command",
        commandObject.cooldown
      );

      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this command again.`,
          type: "warning",
        });
    }

    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild.members.me?.permissions,
        commandObject.botPermissionsRequired,
        commandObject.userPermissionsRequired
      );
    }

    const succeed = (await commandObject.execute(interaction, client)) ?? true;
    if (succeed && commandObject.cooldown) userCooldown.updateCooldown();
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Command Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    handleInteractionError(interaction, error);
  }
};

export default event;
