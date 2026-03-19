import { Modal } from "antd";

/**
 * showModalNotif - reusable modal function dengan ukuran lebih besar
 * @param {Object} options
 * options.type: "success" | "error" | "info" | "warning" | "confirm"
 * options.title: string
 * options.message: string | ReactNode
 * options.onOk: function
 * options.onCancel: function (hanya untuk confirm)
 * options.okText: string
 * options.cancelText: string (hanya untuk confirm)
 * options.width: number (opsional)
 */
export function showModalNotif({
  type = "info",
  title = "",
  message = "",
  onOk,
  onCancel,
  okText,
  cancelText,
  width = 600,
}) {
  const modalProps = {
    title,
    content: message,
    okText: okText || "OK",
    onOk: onOk,
    width,
  };

  switch (type) {
    case "success":
      Modal.success(modalProps);
      break;
    case "error":
      Modal.error(modalProps);
      break;
    case "warning":
      Modal.warning(modalProps);
      break;
    case "info":
      Modal.info(modalProps);
      break;
    case "confirm":
      Modal.confirm({
        ...modalProps,
        cancelText: cancelText || "Cancel",
        onCancel: onCancel,
      });
      break;
    default:
      Modal.info(modalProps);
      break;
  }
}
