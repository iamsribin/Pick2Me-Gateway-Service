import { envChecker } from "@retro-routes/shared";

export const isEnvDefined = () => {
  envChecker(process.env.PORT, "PORT");
  envChecker(process.env.REDIS_URL, "REDIS_URL");
  envChecker(process.env.TRUST_PROXY, "TRUST_PROXY");
  envChecker(process.env.NODE_ENV, "NODE_ENV");
};
