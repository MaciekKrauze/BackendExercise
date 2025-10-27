import { Validator } from './Validator.js';

export class Book {
    constructor(title, author, isbn, publicationYear, totalCopies, borrowedCopies = 0, genre) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.totalCopies = totalCopies;
        this.borrowedCopies = borrowedCopies;
        this.genre = genre;
    }

    get availableCopies() {
        return this.totalCopies - this.borrowedCopies;
    }

    get isAvailable() {
        return this.availableCopies > 0;
    }

    get info() {
        return `${this.title} - ${this.author} (${this.publicationYear}) [${this.genre}] ISBN: ${this.isbn}`;
    }

    get age() {
        const year = new Date().getFullYear();
        return year - this.publicationYear;
    }

    borrow() {
        if (this.isAvailable) {
            this.borrowedCopies++;
            return true;
        }
        return false;
    }

    return() {
        if (this.borrowedCopies > 0) {
            this.borrowedCopies--;
            return true;
        }
        return false;
    }

    getFormattedInfo() {
        return `Tytuł: ${this.title}\nAutor: ${this.author}\nISBN: ${this.isbn}\nRok wydania: ${this.publicationYear}\nGatunek: ${this.genre}\nDostępne: ${this.availableCopies}/${this.totalCopies}`;
    }

    static isValidBook(bookData) {
        return Validator.isValidISBN(bookData.isbn) &&
            Validator.isValidYear(bookData.publicationYear) &&
            bookData.totalCopies > 0;
    }

    static compareByYear(book1, book2) {
        return book1.publicationYear - book2.publicationYear;
    }
}