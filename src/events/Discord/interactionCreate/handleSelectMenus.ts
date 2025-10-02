import _ from "lodash";
import { Interaction } from "discord.js";
import { getSelectObject } from "../../../preloaded";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkPermission from "../../../validator/checkPermission";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { UserInteractionCooldown } from "../../../classes/UserInteractionCooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  if (!interaction.isStringSelectMenu()) return;
  // Check if the customId starts with "$"
  if (!interaction.customId.startsWith("$")) return;

  try {
    const selectMenuOptionObject = getSelectObject(
      _.camelCase(interaction.customId.replace("$", "")),
      _.camelCase(interaction.values[0])
    );

    if (!selectMenuOptionObject) return;

    if (selectMenuOptionObject.disabled) return interaction.deferUpdate();

    // Edit the message components to prevent re-selection issues
    await interaction.message.edit({
      components: interaction.message.components,
    });

    if (selectMenuOptionObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This select menu is for developers only.",
          type: "warning",
        });
    }

    const userCooldown = new UserInteractionCooldown(interaction.user.id);

    if (selectMenuOptionObject.cooldown) {
      const cooldownResponse = userCooldown.isCooledDown(
        interaction.values[0],
        "select",
        selectMenuOptionObject.cooldown
      );

      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this select menu again.`,
          type: "warning",
        });
    }

    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild?.members.me?.permissions,
        selectMenuOptionObject.botPermissionsRequired,
        selectMenuOptionObject.userPermissionsRequired
      );
    }

    const succeed =
      (await selectMenuOptionObject.execute(interaction, client)) ?? true;
    if (succeed && selectMenuOptionObject.cooldown)
      userCooldown.updateCooldown();
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Select Menu Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    handleInteractionError(interaction, error);
  }
};

export default event;
