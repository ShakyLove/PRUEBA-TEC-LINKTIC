export function normalizeApiError(error) {
  if (error?.status && error?.message) {
    return error;
  }

  if (error?.code === "ECONNABORTED") {
    return {
      status: 0,
      message: "No fue posible conectar con el servidor. Intenta nuevamente.",
      raw: error
    };
  }

  const status = error?.response?.status || 0;
  const backendMessage = error?.response?.data?.message;

  const fallbackMessages = {
    401: "Sesion expirada o no autorizada.",
    404: "Producto no encontrado.",
    409: "Stock insuficiente para realizar la compra.",
    422: "Datos invalidos.",
    500: "Ha ocurrido un error inesperado."
  };

  return {
    status,
    message:
      backendMessage ||
      fallbackMessages[status] ||
      "No fue posible conectar con el servidor. Intenta nuevamente.",
    raw: error
  };
}
