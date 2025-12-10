export const typography = {
  display: {
    fontSize: "32px",
    lineHeight: "1.2",
    fontWeight: 600,
  },
  h2: {
    fontSize: "24px",
    lineHeight: "1.3",
    fontWeight: 600,
  },
  h3: {
    fontSize: "18px",
    lineHeight: "1.4",
    fontWeight: 600,
  },
  body: {
    fontSize: "16px",
    lineHeight: "1.6",
    fontWeight: 400,
  },
  caption: {
    fontSize: "13px",
    lineHeight: "1.5",
    fontWeight: 400,
  },
};

export type TypographyRole = keyof typeof typography;

