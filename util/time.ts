export async function wait(condition: () => boolean, timeout = 1000, refreshRate = 250) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, refreshRate));
  }
  return false;
}
