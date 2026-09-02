import type { IUser } from "../models/user.js";

export interface IUserRepository {
    findAll(): Promise<IUser[]>;
    findById(id: number): Promise<IUser | undefined>;
    create(user: IUser): Promise<IUser>;
    update(id: number, data: Partial<IUser>): Promise<IUser | undefined>;
    delete(id: number): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
    private users: IUser[] = [
        {
            id: 1,
            name: "Maria",
            email: "maria@example.com",
            isActive: true,
        },
        {
            id: 2,
            name: "Carlos",
            email: "carlos@example.com",
            isActive: false,
        },
    ];

    async findAll(): Promise<IUser[]> {
        return this.users;
    }

    async findById(id: number): Promise<IUser | undefined> {
        return this.users.find((user) => user.id === id);
    }

    async create(user: IUser): Promise<IUser> {
        this.users.push(user);
        return user;
    }

    async update(
        id: number,
        data: Partial<IUser>
    ): Promise<IUser | undefined> {
        const index = this.users.findIndex((user) => user.id === id);

        if (index === -1) {
            return undefined;
        }

        this.users[index] = {
            ...this.users[index]!,
            ...data,
        };

        return this.users[index];
    }

    async delete(id: number): Promise<boolean> {
        const index = this.users.findIndex((user) => user.id === id);

        if (index === -1) {
            return false;
        }

        this.users.splice(index, 1);
        return true;
    }
}