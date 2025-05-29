declare module 'tailwindcss/lib/util/flattenColorPalette' {
  import type { DefaultColors } from 'tailwindcss/types/generated/colors';

  function flattenColorPalette(colors: DefaultColors): {
    [key: string]: string;
  };

  export default flattenColorPalette;
}
