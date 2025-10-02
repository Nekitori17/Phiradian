import { EmbedBuilder } from "discord.js";
import { handleInteractionError } from "../../helpers/utils/handleError";
import { CommandInterface } from "../../types/InteractionInterfaces";
import CommonEmbedBuilder from "../../helpers/embeds/commonEmbedBuilder";

const command: CommandInterface = {
  async execute(interaction, client) {
    try {
      await interaction.deferReply();

      const serverCheckUpdateURL = new URL(
        "/check-update",
        process.env.BASE_URL
      );
      serverCheckUpdateURL.searchParams.append("version", "0.0.5");
      serverCheckUpdateURL.searchParams.append("flavor", "none");
      const serverResponse = await fetch(serverCheckUpdateURL);
      const serverData = await serverResponse.json();

      if (200 <= serverResponse.status && serverResponse.status < 300) {
        const versionRegex = /^v\d+\.\d+\.\d+$/;
        let newestVersionDescription = "";
        for (const line of (serverData.description as string)
          .split("\n")
          .slice(1, -1)) {
          if (versionRegex.test(line)) break;
          newestVersionDescription += `-# ${line}\n`;
        }

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: interaction.user.displayName,
                iconURL: interaction.user.avatarURL() as string,
              })
              .setTitle("🟢 Phira API is online")
              .setDescription(
                "**The Phira API is currently online and operational.**" +
                  "\n\n" +
                  `> Newest Version - v${serverData.version}` +
                  "\n" +
                  newestVersionDescription
              )
              .setColor("Green")
              .setFooter({
                text: serverData.date,
              })
              .setTimestamp(),
          ],
        });
      } else {
        await interaction.editReply({
          embeds: [
            CommonEmbedBuilder.error({
              title: "🔴 Phira API is offline",
              description:
                "**The Phira API is currently offline or unreachable.**\n\nPlease try again later." +
                "\n\n" +
                "Response:" +
                "\n" +
                "```json" +
                JSON.stringify(serverData, null, 2) +
                "```",
              footer: `Code: ${serverResponse.status} | Message: ${serverResponse.statusText}`,
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
  name: "status",
  description: "Check Phira API status",
  deleted: false,
  devOnly: false,
  useInDm: true,
};

export default command;
