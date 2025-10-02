import fs from "fs";
import path from "path";
import _ from "lodash";

/**
 * Reads directory and returns an array of file or folder paths,
 * optionally excluding some names.
 *
 * @param directory - Directory to read files/folders from.
 * @param folderOnly - If true, return only folders; if false, return only files.
 * @param exception - List of file/folder names to exclude from results.
 * @returns Array of full paths matching criteria.
 */
export default (
  directory: string,
  folderOnly: boolean = false,
  exception: string[] = []
)=> {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  return _(files)
    .filter((file) =>
      folderOnly ? file.isDirectory() : file.isFile()
    )
    .filter((file) => !exception.includes(file.name))
    .map((file) => path.join(directory, file.name))
    .value();
};
