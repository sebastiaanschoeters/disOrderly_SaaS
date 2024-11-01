// theme.js
import { blue, cyan, gold, green, greyDark, lime, magenta, orange, purple, red } from '@ant-design/colors';

export const antThemeTokens = (colors) => ({
    colorPrimary: colors.primary7,         // Main color
    colorPrimaryHover: colors.primary5,    // Hover effect color
    colorPrimaryActive: colors.primary8,   // Active state color
    colorSecondary: colors.primary4,       // Secondary action color
    colorBgBase: colors.primary2,          // Base background color
    colorBgContainer: colors.primary1,     // Background for containers
    colorBgLayout: colors.primary2,        // Background for layout
    colorBorder: colors.primary3,          // Default border color
    colorBorderSecondary: colors.primary4,  // Secondary border color
    colorText: colors.primary10,           // Main text color
    colorTextLight: colors.primary1,       // Light text color
    colorTextSecondary: colors.primary8,   // Secondary text color
    colorTextDescription: colors.primary6, // Text color for descriptions
    colorTextPlaceholder: colors.primary6, // Placeholder text color
    colorTextDisabled: colors.primary3,    // Disabled text color
    colorTextHeading: colors.primary9,     // Text color for headings
});

export const themes = {
    blauw: {
        primary1: blue[0],
        primary2: blue[1],
        primary3: blue[2],
        primary4: blue[3],
        primary5: blue[4],
        primary6: blue[5],
        primary7: blue[6],
        primary8: blue[7],
        primary9: blue[8],
        primary10: blue[9],
    },

    cyaan: {
        primary1: cyan[0],
        primary2: cyan[1],
        primary3: cyan[2],
        primary4: cyan[3],
        primary5: cyan[4],
        primary6: cyan[5],
        primary7: cyan[6],
        primary8: cyan[7],
        primary9: cyan[8],
        primary10: cyan[9],
    },

    goud: {
        primary1: gold[0],
        primary2: gold[1],
        primary3: gold[2],
        primary4: gold[3],
        primary5: gold[4],
        primary6: gold[5],
        primary7: gold[6],
        primary8: gold[7],
        primary9: gold[8],
        primary10: gold[9],
    },

    groen: {
        primary1: green[0],
        primary2: green[1],
        primary3: green[2],
        primary4: green[3],
        primary5: green[4],
        primary6: green[5],
        primary7: green[6],
        primary8: green[7],
        primary9: green[8],
        primary10: green[9],
    },

    donker: {
        primary1: greyDark[0],
        primary2: greyDark[1],
        primary3: greyDark[2],
        primary4: greyDark[3],
        primary5: greyDark[4],
        primary6: greyDark[5],
        primary7: greyDark[6],
        primary8: greyDark[7],
        primary9: greyDark[8],
        primary10: greyDark[9],
    },

    limoen: {
        primary1: lime[0],
        primary2: lime[1],
        primary3: lime[2],
        primary4: lime[3],
        primary5: lime[4],
        primary6: lime[5],
        primary7: lime[6],
        primary8: lime[7],
        primary9: lime[8],
        primary10: lime[9],
    },

    oranje: {
        primary1: orange[0],
        primary2: orange[1],
        primary3: orange[2],
        primary4: orange[3],
        primary5: orange[4],
        primary6: orange[5],
        primary7: orange[6],
        primary8: orange[7],
        primary9: orange[8],
        primary10: orange[9],
    },

    paars: {
        primary1: purple[0],
        primary2: purple[1],
        primary3: purple[2],
        primary4: purple[3],
        primary5: purple[4],
        primary6: purple[5],
        primary7: purple[6],
        primary8: purple[7],
        primary9: purple[8],
        primary10: purple[9],
    },

    roos: {
        primary1: magenta[0],
        primary2: magenta[1],
        primary3: magenta[2],
        primary4: magenta[3],
        primary5: magenta[4],
        primary6: magenta[5],
        primary7: magenta[6],
        primary8: magenta[7],
        primary9: magenta[8],
        primary10: magenta[9],
    },

    rood: {
        primary1: red[0],
        primary2: red[1],
        primary3: red[2],
        primary4: red[3],
        primary5: red[4],
        primary6: red[5],
        primary7: red[6],
        primary8: red[7],
        primary9: red[8],
        primary10: red[9],
    },
};

export default themes;
