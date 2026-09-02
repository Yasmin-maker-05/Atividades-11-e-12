import express from "express";
import type { Request, Response } from "express";

import { errorHandler } from "./src/middlewares/error-handler.middleware.js";
import { AppError } from "./src/errors/app-error.js";
import { ProductService } from "./src/services/product.service.js";
import type { IProduct } from "./src/models/product.js";
import type { RequestHandler } from "express";

import type { IUser } from "./src/models/user.js";
import { UserService } from "./src/services/user.service.js";
import { loggerMiddleware } from "./src/middlewares/logger.middleware.js";
import { UserRepository } from "./src/repositories/user.repository.js";

import type {
    IdParams,
    EmptyParams,
    EmptyBody,
    ProductQuery,
} from "./src/types/http.types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(loggerMiddleware);

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const productService = new ProductService();

function isValidUser(body: unknown): body is IUser {
    if (typeof body !== "object" || body === null) {
        return false;
    }

    const user = body as Record<string, unknown>;

    return (
        typeof user.id === "number" &&
        typeof user.name === "string" &&
        typeof user.email === "string" &&
        typeof user.isActive === "boolean"
    );
}

// GET /users
const listUsers: RequestHandler<
    EmptyParams,
    IUser[],
    EmptyBody,
    {}
> = async (_req, res, next) => {
    try {
        const users = await userService.getAll();

        res.json(users);
    } catch (error: unknown) {
        next(error);
    }
};

app.get("/users", listUsers);

// GET /users/:id
const getUserById: RequestHandler<
    IdParams,
    IUser | { error: string },
    EmptyBody,
    {}
> = async (req, res, next) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const user = await userService.getById(id);

    if (!user) {
        res.status(404).json({ error: "Usuário não encontrado" });
        return;
    }

    res.json(user);
};

app.get("/users/:id", getUserById);

// POST /users
const createUser: RequestHandler<
    EmptyParams,
    IUser | { error: string },
    IUser,
    {}
> = async (req, res) => {
    const body: IUser = req.body;

    if (!isValidUser(body)) {
        res.status(400).json({
            error: "Corpo inválido. Esperado: { id: number, name: string, email: string, isActive: boolean }",
        });
        return;
    }

    const exists = await userService.getById(body.id);

    if (exists) {
        res.status(409).json({
            error: "Já existe um usuário com este ID",
        });
        return;
    }

    const newUser = await userService.create(body);

    res.status(201).json(newUser);
};

app.post("/users", createUser);

// PUT /users/:id
const updateUser: RequestHandler<
    IdParams,
    IUser | { error: string },
    IUser,
    {}
> = async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const body: IUser = req.body;

    if (!isValidUser(body)) {
        res.status(400).json({
            error: "Corpo inválido. Esperado: { id: number, name: string, email: string, isActive: boolean }",
        });
        return;
    }

    if (body.id !== id) {
        res.status(400).json({
            error: "O ID do corpo deve corresponder ao ID da rota",
        });
        return;
    }

    const updatedUser = await userService.update(id, body);

    if (!updatedUser) {
        res.status(404).json({
            error: "Usuário não encontrado",
        });
        return;
    }

    res.json(updatedUser);
};

app.put("/users/:id", updateUser);

// DELETE /users/:id
const deleteUser: RequestHandler<
    IdParams,
    IUser | { error: string },
    EmptyBody,
    {}
> = async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        res.status(400).json({ error: "ID inválido" });
        return;
    }

    const removedUser = await userService.delete(id);

    if (!removedUser) {
        res.status(404).json({
            error: "Usuário não encontrado",
        });
    return;
}

res.status(204).send();
};

app.delete("/users/:id", deleteUser);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.get("/teste-erro", () => {
    throw new AppError("Esse é um erro de teste", 400);
});

// GET /products
const listProducts: RequestHandler<
    EmptyParams,
    IProduct[],
    EmptyBody,
    ProductQuery
> = (req, res) => {
    const products = productService.getAll();

    res.json(products);
};

app.get("/products", listProducts);

// GET /products/:id
const getProductById: RequestHandler<
    IdParams,
    IProduct | { message: string },
    EmptyBody,
    {}
> = (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
        throw new AppError("ID inválido", 400);
    }

    const product = productService.getById(id);

    res.json(product);
};

app.get("/products/:id", getProductById);

const createProduct: RequestHandler<
    EmptyParams,
    IProduct,
    IProduct,
    {}
> = (req, res, next) => {
    try {
        const product: IProduct = req.body;

        const newProduct = productService.create(product);

        res.status(201).json(newProduct);
    } catch (error: unknown) {
        next(error);
    }
};

app.post("/products", createProduct);

const updateProduct: RequestHandler<
    IdParams,
    IProduct,
    Partial<IProduct>,
    {}
> = (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            throw new AppError("ID inválido", 400);
        }

        const updatedProduct = productService.update(id, req.body);

        res.json(updatedProduct);
    } catch (error: unknown) {
        next(error);
    }
};

app.put("/products/:id", updateProduct);

const deleteProduct: RequestHandler<
    IdParams,
    void,
    EmptyBody,
    {}
> = (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            throw new AppError("ID inválido", 400);
        }

        productService.delete(id);

        res.status(204).send();
    } catch (error: unknown) {
        next(error);
    }
};

app.delete("/products/:id", deleteProduct);

app.use(errorHandler);