import type { Shell } from "../shell";
import type { CommandMap } from "../types";
import { ctfCommands } from "./ctf";
import { eggCommands } from "./eggs";
import { encodingCommands } from "./encoding";
import { fileCommands } from "./files";
import { gameCommands } from "./games";
import { helpCommands } from "./help";
import { siteCommands } from "./site";
import { systemCommands } from "./system";
import { textCommands } from "./text";
import { toyCommands } from "./toys";
import { ALIASES, MANUAL } from "./manual";

export const createCommands = (sh: Shell): CommandMap => {
  const cmds: CommandMap = {
    ...fileCommands(sh),
    ...textCommands(sh),
    ...encodingCommands(sh),
    ...systemCommands(sh),
    ...helpCommands(sh),
    ...siteCommands(sh),
    ...ctfCommands(sh),
    ...eggCommands(sh),
    ...toyCommands(sh),
    ...gameCommands(sh),
  };
  cmds.printenv = cmds.env!;
  cmds.hexdump = cmds.xxd!;
  for (const [name, fn] of Object.entries(cmds)) {
    cmds[name] = (args, io) => {
      if (args.length === 1 && args[0] === "--help" && MANUAL[ALIASES[name] ?? name])
        return void cmds.help!([name], io);
      return fn(args, io);
    };
  }
  return cmds;
};
