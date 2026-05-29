import { createDiscreteApi } from "naive-ui";

const { message, notification } = createDiscreteApi(["message", "notification"]);

export function useNotifications() {
  return {
    success(content) {
      message.success(content);
    },
    error(content) {
      message.error(content);
    },
    warning(content) {
      message.warning(content);
    },
    info(content) {
      notification.info({
        title: "Informacion",
        content
      });
    }
  };
}
