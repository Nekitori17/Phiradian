import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { handleInteractionError } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import howToObtainId from "../../components/howToObtainId";
import { CommandInterface } from "../../types/InteractionInterfaces";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const chartIdOption = interaction.options.getInteger("id", true);

      const chartInfoResponse = await fetch(
        `${process.env.BASE_URL}/chart/${chartIdOption}`
      );
      const chartInfoData = await chartInfoResponse.json();

      if (200 <= chartInfoResponse.status && chartInfoResponse.status < 300) {
        const buttonNavRow =
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setEmoji("📥")
              .setLabel("Download")
              .setStyle(ButtonStyle.Link)
              .setURL(chartInfoData.file),
            new ButtonBuilder()
              .setEmoji("🗺️")
              .setLabel("Chart Webpage")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://phira.moe/chart/${chartIdOption}`)
          );

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.avatarURL() as string,
              })
              .setTitle("Chart ID: " + chartIdOption)
              .setDescription(
                `${chartInfoData.composer}` +
                  "\n" +
                  `> **${chartInfoData.name}** - __${chartInfoData.level}__` +
                  "\n" +
                  `by *${chartInfoData.charter}*` +
                  "\n\n" +
                  "Direct download link:" +
                  "\n" +
                  chartInfoData.file
              )
              .setColor("Aqua")
              .setTimestamp(),
          ],
          components: [buttonNavRow],
        });
      } else if (chartInfoResponse.status === 404) {
        await interaction.editReply({
          embeds: [
            CommonEmbedBuilder.error({
              title: "Chart Not Found",
              description: `We could not find a chart with ID \`${chartIdOption}\` on Phira's API. Make sure the chart exists (is publicly visible) and you typed the ID correctly.`,
            }),
          ],
          components: [howToObtainId],
        });
      } else {
        await interaction.editReply({
          embeds: [
            CommonEmbedBuilder.error({
              title: "Unknown Error",
              description:
                `An unknown error occurred while trying to fetch chart with ID \`${chartIdOption}\`.` +
                "\n\n" +
                "Response:" +
                "\n" +
                "```json" +
                JSON.stringify(chartInfoData, null, 2) +
                "```",
              footer: `Code: ${chartInfoResponse.status} | Message: ${chartInfoResponse.statusText}`,
            }),
          ],
        });
      }

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "chart-downloader",
  description: "Download chart from Phira directly",
  deleted: false,
  options: [
    {
      name: "id",
      description: "Enter your id chart",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  devOnly: false,
  useInDm: true,
};

export default command;
