export const getRequestKey = (service, method, id, methodParams) => `${service}:${method}:${id}:${JSON.stringify(methodParams)}`;

export const getEntityKey = (service, id) => `${service}:${id}`;
