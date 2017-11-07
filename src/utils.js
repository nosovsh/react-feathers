export const getRequestKey = (service, method, id, methodParams) => `${service}:${method}:${id}:${JSON.stringify(methodParams)}`;
