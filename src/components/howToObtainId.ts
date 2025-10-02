import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder()
    .setCustomId("$phira_how-to-get-id")
    .setLabel("How to obtain ID?")
    .setStyle(ButtonStyle.Secondary)
    .setEmoji("❓")
);
