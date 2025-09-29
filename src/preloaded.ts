import fs from "fs";
import _ from "lodash";
import path from "path";
import { getLocal } from "./helpers/utils/getLocal";
import getAllFiles from "./helpers/utils/getAllFiles";
import {
  ButtonInterface,
  CommandInterface,
  ContextInterface,
  SelectMenuInterface,
} from "./types/InteractionInterfaces";

export const commandMap = new Map<string, CommandInterface>();
export const commandLowerCaseMap = new Map<string, CommandInterface>();
export const contextMap = new Map<string, ContextInterface>();
export const buttonMap = new Map<string, ButtonInterface>();
export const selectMap = new Map<string, SelectMenuInterface>();

/**
 * Preloads interaction components from categorized directories.
 * It iterates through subdirectories (categories) within the given root path,
 * and for each file in those subdirectories, it loads the component and stores it
 * in the provided sourceMap with a key formatted as "categoryName.fileName".
 * @template T - The type of the interaction component (e.g., ButtonInterface, SelectMenuInterface).
 * @param {string} root - The root directory where categories of components are located.
 * @param {Map<string, T>} sourceMap - The Map to store the preloaded components.
 */
function preloadCategoryMap<T>(root: string, sourceMap: Map<string, T>) {
  const categories = getAllFiles(root, true);

  for (const category of categories) {
    const categoryName = path.basename(category);

    const files = getAllFiles(category);

    for (const file of files) {
      const fileName = path.parse(file).name;

      const item = require(file).default as T;

      sourceMap.set(`${categoryName}.${fileName}`, item);
    }
  }
}

/**
 * Loads all commands, contexts, buttons, and select menus from their respective directories into maps for quick access.
 */
export function preload() {
  // Load all command with normal slash command, message command and alias
  const allLocalCommands = getLocal<CommandInterface>(
    path.join(__dirname, "./commands")
  );

  for (const command of allLocalCommands) {
    commandMap.set(command.name, command);

    commandLowerCaseMap.set(
      command.name.replace(/-/gi, "").toLowerCase(), // Convert kebab-case to lowercase
      command
    );
  }

  const contextFolderPath = path.join(__dirname, "./contexts");
  if (fs.existsSync(contextFolderPath)) {
    // Load all context menus
    const allLocalContext = getLocal<ContextInterface>(contextFolderPath);

    for (const context of allLocalContext) {
      contextMap.set(context.name, context);
    }
  }

  const buttonFolderPath = path.join(__dirname, "./buttons");
  if (fs.existsSync(buttonFolderPath))
    // Load all buttons
    preloadCategoryMap<ButtonInterface>(buttonFolderPath, buttonMap);

  const selectFolderPath = path.join(__dirname, "./menus/selects");
  if (fs.existsSync(selectFolderPath))
    // Load all select menu
    preloadCategoryMap<SelectMenuInterface>(selectFolderPath, selectMap);
}

export function getExactCommandObject(commandName: string) {
  return commandMap.get(commandName);
}

export function getLowerCaseCommandObject(commandName: string) {
  return commandLowerCaseMap.get(commandName);
}

export function getCommandObject(commandName: string) {
  return (
    getLowerCaseCommandObject(commandName) || getExactCommandObject(commandName)
  );
}

export function getContextObject(contextName: string) {
  return contextMap.get(contextName);
}

export function getButtonObject(category: string, buttonName: string) {
  return buttonMap.get(`${category}.${buttonName}`);
}

export function getSelectObject(category: string, selectName: string) {
  return selectMap.get(`${category}.${selectName}`);
}
