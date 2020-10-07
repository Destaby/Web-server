import { Metacom } from './metacom.js';
const metacom = new Metacom(location.host);
export const getApi = async (load, special) => {
  if (load) await metacom.load(...load);
  if (special) await metacom.special(...special);
  return metacom.api;
};
