import type { IUser } from "../models/user.js";
import {
    UserRepository,
    type IUserRepository,
} from "../repositories/user.repository.js";

export class UserService {
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async getAll(): Promise<IUser[]> {
        return await this.userRepository.findAll();
    }

    async getById(id: number): Promise<IUser | undefined> {
        return await this.userRepository.findById(id);
    }

    async create(user: IUser): Promise<IUser> {
        return await this.userRepository.create(user);
    }

    async update(
        id: number,
        user: Partial<IUser>
    ): Promise<IUser | undefined> {
        return await this.userRepository.update(id, user);
    }

    async delete(id: number): Promise<boolean> {
        return await this.userRepository.delete(id);
    }
}