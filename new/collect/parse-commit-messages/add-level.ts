import type { Message, MessageConventionalCommit } from "../../types";

export const addLevel = (
  messageConventional: MessageConventionalCommit
): Message => {
  const message: Message = { ...messageConventional, level: "misc" };

  if (message.text?.includes("BREAKING")) {
    message.level = "major";
  } else {
    switch (message.type) {
      case "feat":
        message.level = "minor";
        break;
      case "fix":
      case "style":
        message.level = "patch";
        break;
      default:
        break;
    }
  }

  return message;
};
