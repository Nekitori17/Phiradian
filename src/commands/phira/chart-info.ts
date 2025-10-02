import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonStyle,
  ButtonBuilder,
  EmbedBuilder,
} from "discord.js";
import mediaConverter from "../../helpers/tools/mediaConverter";
import { handleInteractionError } from "../../helpers/utils/handleError";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";
import howToObtainId from "../../components/howToObtainId";
import { CommandInterface } from "../../types/InteractionInterfaces";
import { CustomError } from "../../helpers/utils/CustomError";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();
      const chartIdOption = interaction.options.getInteger("id", true);

      await interaction.editReply(
        `> 🔍 [1/3] | Fetching chart information at */chart/${chartIdOption}`
      );

      const chartInfoResponse = await fetch(
        `https://api.phira.cn/chart/${chartIdOption}`
      );
      if (chartInfoResponse.status == 404) {
        await interaction.editReply({
          embeds: [
            CommonEmbedBuilder.error({
              title: "Chart Not Found",
              description: `We could not find a chart with ID \`${chartIdOption}\` on Phira's API. Make sure the chart exists (is publicly visible) and you typed the ID correctly.`,
            }),
          ],
          components: [howToObtainId],
        });

        return true;
      } else if (!chartInfoResponse.ok) {
        await interaction.editReply({
          embeds: [
            CommonEmbedBuilder.error({
              title: "Phira API Error",
              description:
                "An error occurred while fetching chart information from Phira's API." +
                "\n" +
                "Please try again later." +
                "\n\n" +
                "```json" +
                "\n" +
                JSON.stringify(chartInfoResponse, null, 2) +
                "\n" +
                "```",
              footer: `Code: ${chartInfoResponse.status} | Message: ${chartInfoResponse.statusText}`,
            }),
          ],
        });
      }

      const chartInfoData = await chartInfoResponse.json();

      await interaction.editReply(
        `> 🔍 [2/3] | Fetching uploader information at */user/${chartInfoData.uploader}`
      );

      const uploaderInfoData = await fetch(
        `https://api.phira.cn/user/${chartInfoData.uploader}`
      ).then((res) => {
        if (!res.ok)
          throw new CustomError({
            name: `${res.status} ${res.statusText}`,
            message:
              "An error occurred while fetching uploader information from Phira's API." +
              "\n\n" +
              "```json" +
              "\n" +
              JSON.stringify(res, null, 2) +
              "\n" +
              "```",
          });

        return res.json();
      });

      await interaction.editReply("> 📄 [3/3] | Converting illustration..");

      // Convert illustration file to png
      const chartIllustration = await mediaConverter({
        url: chartInfoData.illustration as string,
        format: "png",
      });

      const functionButtons = [
        new ButtonBuilder()
          .setLabel("Leaderboard")
          .setEmoji("📊")
          .setCustomId("chart-leaderboard")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setLabel("Beatmap")
          .setEmoji("🗺")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://phira.moe/chart/${chartInfoData.id}`),
        new ButtonBuilder()
          .setLabel("Uploader")
          .setEmoji("👤")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://phira.moe/user/${uploaderInfoData.id}`),
      ];

      const functionButtonRow =
        new ActionRowBuilder<ButtonBuilder>().addComponents(functionButtons);

      interaction.editReply({
        content: null,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.displayName,
              iconURL: interaction.user.avatarURL() as string,
            })
            .setTitle(`> __${chartInfoData.composer}__ - ${chartInfoData.name}`)
            .setDescription(
              `* **Level**: ${chartInfoData.level}\n` +
                `* **Charter**: ${chartInfoData.charter}\n` +
                `* **Rating**: ${((chartInfoData.rating / 2) * 10).toFixed(
                  2
                )} (${chartInfoData.ratingCount} Users)\n` +
                `* **Description**: ${chartInfoData.description}\n` +
                `* **Ranked**: ${chartInfoData.ranked ? "Yes" : "No"}\n` +
                `* **Review**: ${chartInfoData.reviewed ? "Yes" : "No"}\n` +
                `* **Stable**: ${chartInfoData.stable ? "Yes" : "No"}\n`
            )
            .setThumbnail(
              "https://raw.githubusercontent.com/TeamFlos/phira/main/assets/icon.png"
            )
            .setImage(`attachment://${chartIllustration?.name}`)
            .setColor("Aqua")
            .setFooter({
              text: `Uploaded by: ${uploaderInfoData.name} (Followers: ${uploaderInfoData.follower_count})`,
            })
            .setTimestamp(),
        ],
        components: [functionButtonRow],
        files: [chartIllustration!],
      });

      return true;
    } catch (error) {
      handleInteractionError(interaction, error);

      return false;
    }
  },
  name: "chart-info",
  description: "Fetch chart information from API",
  deleted: false,
  devOnly: false,
  options: [
    {
      name: "id",
      description: "Enter your id chart",
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
  useInDm: true,
};

export default command;
