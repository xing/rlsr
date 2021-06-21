import { command } from "../helpers/command";

export const checkNpmLogin = command(
  "check npm login",
  (env) =>
    `npm whoami${
      env.config?.registry ? ` --registry=${env.config?.registry}` : ""
    }`,
  "silent",
  "inf"
);
