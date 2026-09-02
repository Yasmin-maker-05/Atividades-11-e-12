import type { IProduct } from "../models/product.js";
import { AppError } from "../errors/app-error.js";

export class ProductService {
    private products: IProduct[] = [
        {
            id: 1,
            name: "Coca-Cola",
            price: 5,
        },
        {
            id: 2,
            name: "Batata Frita",
            price: 10,
        },
    ];

    getAll(): IProduct[] {
        return this.products;
    }

    getById(id: number): IProduct {
        const product = this.products.find((product) => product.id === id);

        if (!product) {
            throw new AppError("Produto não encontrado", 404);
        }

        return product;
    }

    create(product: IProduct): IProduct {
        if (typeof product.name !== "string") {
            throw new AppError("O nome do produto deve ser um texto", 400);
        }

        if (product.name.trim().length < 3) {
            throw new AppError("O nome do produto deve ter no mínimo 3 caracteres", 400);
        }

        if (typeof product.price !== "number" || Number.isNaN(product.price)) {
            throw new AppError("O preço do produto deve ser um número", 400);
        }

        if (product.price < 0) {
            throw new AppError("O preço do produto não pode ser negativo", 400);
        }

        this.products.push(product);

        return product;
    }

    update(id: number, product: Partial<IProduct>): IProduct {
        const index = this.products.findIndex((product) => product.id === id);

        if (index === -1) {
            throw new AppError("Produto não encontrado", 404);
        }

        if (product.name !== undefined) {
            if (typeof product.name !== "string") {
                throw new AppError("O nome do produto deve ser um texto", 400);
            }

            if (product.name.trim().length < 3) {
                throw new AppError("O nome do produto deve ter no mínimo 3 caracteres", 400);
            }
        }

        if (product.price !== undefined) {
            if (typeof product.price !== "number" || Number.isNaN(product.price)) {
                throw new AppError("O preço do produto deve ser um número", 400);
            }

            if (product.price < 0) {
                throw new AppError("O preço do produto não pode ser negativo", 400);
            }
        }

        this.products[index] = {
            ...this.products[index]!,
            ...product,
            id,
        };

        return this.products[index]!;
    }

    delete(id: number): void {
        const index = this.products.findIndex((product) => product.id === id);

        if (index === -1) {
            throw new AppError("Produto não encontrado", 404);
        }

        this.products.splice(index, 1);
    }
}