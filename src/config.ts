import { ActivityType, PermissionFlagsBits, PresenceData } from "discord.js";

export default {
  presenceRotateList: [
    {
      activities: [
        {
          name: `/help`,
          type: ActivityType.Listening,
        },
      ],
      status: "online",
    },
    {
      activities: [
        {
          name: "Phigros is the best Rhythm Game",
          type: ActivityType.Watching,
        },
      ],
      status: "idle",
    },
    {
      activities: [
        {
          name: `Phira Utilities`,
          type: ActivityType.Competing,
        },
      ],
      status: "dnd",
    },
  ] as PresenceData[],
  presenceIntervalTime: 10000,
  defaultBotPermissionsRequired: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
  ],
};
