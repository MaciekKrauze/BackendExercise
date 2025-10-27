export class Validator {
    static isValidISBN(isbn) {
        return /^\d{13}$/.test(isbn);
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static isValidYear(year) {
        return year > 1000 && year <= new Date().getFullYear();
    }

    static isValidPageCount(pages) {
        return pages > 0;
    }
}