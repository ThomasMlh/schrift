export interface Guild {
    _id: string;
    name: string;
}

export type Role = "chef" | "sous-chef" | "membre";

export interface Member {
    _id: string;
    name: string;
    role: Role;
}

export interface GuildAPI extends Guild {
    members: Member[];
}

export interface MemberAPI extends Member {
    guilde_id: string;
}