export const state = {
  live: true, // toggled by SIGUSR1 — fakes a wedged process
  accepting: true, // set false during shutdown
};
