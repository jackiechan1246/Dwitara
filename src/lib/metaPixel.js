import * as ReactPixelRaw from "react-facebook-pixel";
const ReactPixel = ReactPixelRaw.default || ReactPixelRaw;

const options = {
  autoConfig: true,
  debug: false,
};

export const initMetaPixel = () => {
  ReactPixel.init("1557564425879005", {}, options);
  ReactPixel.pageView();
};

export default ReactPixel;
