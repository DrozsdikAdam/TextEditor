export const Source = {
    ORIGINAL: "original",
    ADD: "add",
} as const;

export type Source = typeof Source[keyof typeof Source];