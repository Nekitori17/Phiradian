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
          name: `Phira`,
          type: ActivityType.Watching,
        },
      ],
      status: "idle",
    },
    {
      activities: [
        {
          name: `Phigros`,
          type: ActivityType.Competing,
        },
      ],
      status: "dnd",
    },
  ] as PresenceData[],
  presenceIntervalTime: 10000,
  geminiAI: {
    model: "gemini-2.5-pro",
  },
  defaultBotPermissionsRequired: [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
  ],
};
