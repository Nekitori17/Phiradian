import _ from "lodash";
import { Interaction } from "discord.js";
import { getButtonObject } from "../../../preloaded";
import { CustomError } from "../../../helpers/utils/CustomError";
import checkPermission from "../../../validator/checkPermission";
import { handleInteractionError } from "../../../helpers/utils/handleError";
import { UserInteractionCooldown } from "../../../classes/UserInteractionCooldown";
import { DiscordEventInterface } from "../../../types/EventInterfaces";

const event: DiscordEventInterface = async (
  client,
  interaction: Interaction
) => {
  if (!interaction.isButton()) return;
  // Check if the customId starts with "$"
  if (!interaction.customId.startsWith("$")) return;

  try {
    const [category, customId] = interaction.customId.split("_");

    const buttonObject = getButtonObject(
      _.camelCase(category.replace("$", "")),
      _.camelCase(customId)
    );

    if (!buttonObject) return;

    if (buttonObject.disabled) return interaction.deferUpdate();

    if (buttonObject.devOnly) {
      const DEVELOPERS = (process.env.DEVELOPER_ACCOUNT_IDS as string).split(
        ","
      );

      if (!DEVELOPERS.includes(interaction.user.id))
        throw new CustomError({
          name: "DeveloperOnly",
          message: "This button is for developers only.",
          type: "warning",
        });
    }

    let userCooldown = new UserInteractionCooldown(interaction.user.id);

    if (buttonObject.cooldown) {
      const cooldownResponse = userCooldown.isCooledDown(
        interaction.customId.slice(1),
        "button",
        buttonObject.cooldown
      );

      if (!cooldownResponse.cooledDown && cooldownResponse.nextTime)
        throw new CustomError({
          name: "Cooldown",
          message: `Please wait <t:${cooldownResponse.nextTime}:R> before using this button again.`,
          type: "warning",
        });
    }

    if (interaction.guild) {
      checkPermission(
        interaction.member?.permissions,
        interaction.guild.members.me?.permissions,
        buttonObject.botPermissionsRequired,
        buttonObject.userPermissionsRequired
      );
    }

    const succeed = (await buttonObject.execute(interaction, client)) ?? true;
    if (succeed && buttonObject.cooldown) userCooldown.updateCooldown();
  } catch (error) {
    if (error instanceof Error) {
      console.log(
        `\x1b[31m\x1b[1m|> ${error.name} (Button Interaction)\x1b[0m`
      );
      console.log(`\x1b[32m${error.message}\x1b[0m`);
      console.log(error);
    }

    handleInteractionError(interaction, error, true);
  }
};

export default event;
