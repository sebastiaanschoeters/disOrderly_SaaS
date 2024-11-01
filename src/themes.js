// themes.js
// theme.js
import { blue, green, red, purple, orange,yellow, magenta, cyan, gray} from '@ant-design/colors'

export const antThemeTokens = (colors) => ({
    colorPrimary: colors.primary6,         // Main color
    colorPrimaryHover: colors.primary5,    // Hover effect color
    colorPrimaryActive: colors.primary7,   // Active state color
    colorSecondary: colors.primary4,       // Secondary action color
    colorBgBase: colors.primary2,          // Base background color
    colorBgContainer: colors.primary2,     // Background for containers
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
    default: {
        primary1: blue[0],
        primary2: blue[1],
        primary3: blue[2],
        primary4: blue[3],
        primary5: blue[4],
        primary6: blue[5],
        primary7: blue[6],
        primary8: blue[7],
        primary9: blue[8],
        primary10: blue[9]
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
        primary10: purple[9]
    },

    rood:{
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
    }
};

export default themes;
