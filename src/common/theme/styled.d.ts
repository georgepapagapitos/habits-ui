import "styled-components";
import theme from "./index";

type ThemeType = typeof theme;

declare module "styled-components" {
  // We extend DefaultTheme with the properties defined in ThemeType
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends ThemeType {}
}
