// theme.js
import {
    blue,
    blueDark,
    cyan,
    cyanDark,
    gold,
    goldDark,
    green,
    greenDark,
    grey,
    greyDark,
    lime,
    limeDark,
    magenta,
    magentaDark,
    orange,
    orangeDark,
    purple,
    purpleDark,
    red,
    redDark
} from '@ant-design/colors';

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

    blauw_donker:{
        primary1: blueDark[0],
        primary2: blueDark[1],
        primary3: blueDark[2],
        primary4: blueDark[3],
        primary5: blueDark[4],
        primary6: blueDark[5],
        primary7: blueDark[6],
        primary8: blueDark[7],
        primary9: blueDark[8],
        primary10: blueDark[9],
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

    cyaan_donker: {
        primary1: cyanDark[0],
        primary2: cyanDark[1],
        primary3: cyanDark[2],
        primary4: cyanDark[3],
        primary5: cyanDark[4],
        primary6: cyanDark[5],
        primary7: cyanDark[6],
        primary8: cyanDark[7],
        primary9: cyanDark[8],
        primary10: cyanDark[9],
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

    goud_donker: {
        primary1: goldDark[0],
        primary2: goldDark[1],
        primary3: goldDark[2],
        primary4: goldDark[3],
        primary5: goldDark[4],
        primary6: goldDark[5],
        primary7: goldDark[6],
        primary8: goldDark[7],
        primary9: goldDark[8],
        primary10: goldDark[9],
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

    groen_donker: {
        primary1: greenDark[0],
        primary2: greenDark[1],
        primary3: greenDark[2],
        primary4: greenDark[3],
        primary5: greenDark[4],
        primary6: greenDark[5],
        primary7: greenDark[6],
        primary8: greenDark[7],
        primary9: greenDark[8],
        primary10: greenDark[9],
    },

    grijs: {
        primary1: grey[0],
        primary2: grey[1],
        primary3: grey[2],
        primary4: grey[3],
        primary5: grey[4],
        primary6: grey[5],
        primary7: grey[6],
        primary8: grey[7],
        primary9: grey[8],
        primary10: grey[9],
    },

    grijs_donker: {
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

    limoen_donker: {
        primary1: limeDark[0],
        primary2: limeDark[1],
        primary3: limeDark[2],
        primary4: limeDark[3],
        primary5: limeDark[4],
        primary6: limeDark[5],
        primary7: limeDark[6],
        primary8: limeDark[7],
        primary9: limeDark[8],
        primary10: limeDark[9],
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

    oranje_donker: {
        primary1: orangeDark[0],
        primary2: orangeDark[1],
        primary3: orangeDark[2],
        primary4: orangeDark[3],
        primary5: orangeDark[4],
        primary6: orangeDark[5],
        primary7: orangeDark[6],
        primary8: orangeDark[7],
        primary9: orangeDark[8],
        primary10: orangeDark[9],
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

    paars_donker: {
        primary1: purpleDark[0],
        primary2: purpleDark[1],
        primary3: purpleDark[2],
        primary4: purpleDark[3],
        primary5: purpleDark[4],
        primary6: purpleDark[5],
        primary7: purpleDark[6],
        primary8: purpleDark[7],
        primary9: purpleDark[8],
        primary10: purpleDark[9],
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

    roos_donker: {
        primary1: magentaDark[0],
        primary2: magentaDark[1],
        primary3: magentaDark[2],
        primary4: magentaDark[3],
        primary5: magentaDark[4],
        primary6: magentaDark[5],
        primary7: magentaDark[6],
        primary8: magentaDark[7],
        primary9: magentaDark[8],
        primary10: magentaDark[9],
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

    rood_donker: {
        primary1: redDark[0],
        primary2: redDark[1],
        primary3: redDark[2],
        primary4: redDark[3],
        primary5: redDark[4],
        primary6: redDark[5],
        primary7: redDark[6],
        primary8: redDark[7],
        primary9: redDark[8],
        primary10: redDark[9],
    },
};

export default themes;
