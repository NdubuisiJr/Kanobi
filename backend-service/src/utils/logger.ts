export const logInfo = (functionName: string, value: any) =>
  console.log(
    "\x1b[32m%s\x1b[0m",
    "[INFO]: ",
    functionName?.toUpperCase(),
    value
  );
export const logError = (functionName: string, value: any) =>
  console.error(
    "\x1b[31m%s\x1b[0m",
    "[ERROR]: ",
    functionName?.toUpperCase(),
    value
  );
export const logWarning = (functionName: string, value: any) =>
  console.warn(
    "\x1b[33m%s\x1b[0m",
    "[ERROR]: ",
    functionName?.toUpperCase(),
    value
  );
