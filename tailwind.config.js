import { nextui } from "@nextui-org/react";

export default {
  content: ['index.html', './src/**/*.{js,jsx,ts,tsx,vue,html}', "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui()],
};
