import ReactGA from "react-ga4";

const TRACKING_ID = "G-EQ4801JGM0";
let ready = false;

export const initAnalytics = () => {
  if (ready || import.meta.env.DEV) return;
  ReactGA.initialize(TRACKING_ID);
  ready = true;
};

export const track = (action: string, label?: string) => {
  if (!ready) return;
  ReactGA.event({ category: "Portfolio", action, label });
};
