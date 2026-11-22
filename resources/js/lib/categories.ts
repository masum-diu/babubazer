export type SidebarCategory = {
    id: number;
    name: string;
    slug: string;
    children?: Array<{ id: number; name: string; slug: string }>;
};
