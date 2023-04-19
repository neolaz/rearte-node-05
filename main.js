const fs = require('fs');

class Product{
    constructor (id, code, title, description, price, thumbnail, stock){
        this.id = id
        this.code = code;
        this.title = title;
        this.description = description;
        this.price = price;
        this.thumbnail = thumbnail;
        this.stock = stock;
    }
}

class ProductManager{
    constructor (){
        this.path = './products.json';
        this.lastProductId = 0
    }

    async addProduct(code, title, description, price, thumbnail, stock){
        const codeOk = await this.checkCode(code);
        const fieldsOk = this.checkFields(code, title, description, price, thumbnail, stock);

        if (codeOk && fieldsOk) {
            const newProductId = await this.generateProductId()
            const newProduct = new Product(newProductId, code, title, description, price, thumbnail, stock);
            const products = await this.getProducts()
            products.push(newProduct);
            await fs.promises.writeFile(this.path, JSON.stringify(products));
            console.log(`El producto fue agregado.`);
        } else {
            let msgError = "";
            if (!codeOk) msgError += "El código del producto que está intentando agregar está repetido.";
            if (!fieldsOk) msgError += "Alguno de los campos ingresados para el nuevo producto está vacío.";
            console.log(msgError);
        }
    }

    async updateProductById(id, code, title, description, price, thumbnail, stock){
        const p = await this.getProductById(id);

        if(p !== undefined){
            let products = await this.getProducts();
            let index = await this.getProductIndex(id);
            const updatedProduct = new Product(id, code, title, description, price, thumbnail, stock);
            products[index] = updatedProduct;
            await fs.promises.writeFile(this.path, JSON.stringify(products));
            console.log(`El producto ${id} fue modificado`);
        } else {
            console.log("El producto a modificar no existe.");
        }
    }

    async deleteProductById(id){
        const p = await this.getProductById(id);

        if(p !== undefined){
            let products = await this.getProducts();
            products = products.filter(pr => pr.id != id);
            await fs.promises.writeFile(this.path, JSON.stringify(products));
            console.log(`El producto ${id} fue eliminado`);
        } else {
            console.log("El producto a eliminar no existe.")
        }
    }

    async generateProductId(){
        const products = await this.getProducts();
        return (products.length > 0 ? products[products.length -1].id + 1 : 1);
    }

    async getProducts(){
        try {
            if (fs.existsSync(this.path)){
                const products = await fs.promises.readFile(this.path, 'utf8');
                return JSON.parse(products);
            } else {
                return []
            }
        } catch (error) {
            console.log(error);  
        }
    }

    async showProducts(){
        const products = await this.getProducts();
        console.log(products.length > 0 ? console.log(products) : console.log("Aún no hay productos cargados."));
    }

    async getProductById(id){
        const products = await this.getProducts();
        const p = products.find(p => p.id == id);
        return p;
    }

    async showProductsById(id){
        const products = await this.getProducts();
        const p = products.find(p => p.id == id);

        console.log(p === undefined ? console.log("El producto no existe.") : console.log(p));
    }

    async checkCode(code){
        const products = await this.getProducts();
        const p = products.find(p => p.code == code);
        return ((p === undefined && code != "") ? true : false);
    }

    checkFields(code, title, description, price, thumbnail, stock){
        return ((code != "" && title != "" && description != "" && price > 0 && thumbnail != "" && stock > 0) ? true : false);
    }

    async getProductIndex(id){
        const products = await this.getProducts();

        for (let i = 0; i < products.length; i++) {
            if(products[i].id === id) return i;
        }
        return -1;
    }
}

// Testing
const productManager = new ProductManager();

const test = async() => {
    await productManager.showProducts();
    await productManager.addProduct("abc123", "producto prueba", "Este es un producto prueba", 200, "Sin imagen", 25);
    await productManager.showProducts();
    await productManager.showProductsById(25);
    await productManager.showProductsById(1);
    await productManager.updateProductById(25, "def456", "producto prueba modificado", "Este es un producto prueba modificado", 300, "Sin imagen de nuevo", 30);
    await productManager.updateProductById(1, "def456", "producto prueba modificado", "Este es un producto prueba modificado", 300, "Sin imagen de nuevo", 30);
    await productManager.deleteProductById(25);
    await productManager.deleteProductById(1);
}

test()