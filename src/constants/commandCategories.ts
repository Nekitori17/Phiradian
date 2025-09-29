/**
 *  Command categories and their properties. 
 */
 

export const commandCategories = Object.fromEntries(
  Object.entries({
    core: {
      label: "Core",
      emoji: "💻",
      description: "Essential commands for bot functionality",
    },
    phira: {
      label: "Phira",
      emoji: "🎵",
      description: "Phira Utilites",
    },
    utils: {
      label: "Utils",
      emoji: "🛠️",
      description: "Utility commands to enhance functionality",
    },
  }).sort(([, a], [, b]) => a.label.localeCompare(b.label))
);
