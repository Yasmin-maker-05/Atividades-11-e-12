export type IdParams = {
    id: string;
};

export type EmptyParams = Record<string, never>;

export type EmptyBody = Record<string, never>;

export type ProductQuery = {
    name?: string;
};