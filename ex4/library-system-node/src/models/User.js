import { DateUtils } from './DateUtils.js';

export class User {
    constructor(name, email, registrationDate = new Date()) {
        this.name = name;
        this.email = email;
        this.registrationDate = registrationDate;
        this.borrowedBooks = [];
        this.borrowHistory = [];
    }

    get canBorrow() {
        return this.borrowedBooks.length < 5;
    }

    get borrowCount() {
        return this.borrowedBooks.length;
    }

    get profile() {
        return {
            name: this.name,
            email: this.email,
            registrationDate: this.registrationDate,
            borrowedBooks: this.borrowedBooks,
            borrowHistory: this.borrowHistory
        }
    }

    addBorrowedBook(isbn, bookTitle) {
        this.borrowedBooks.push(isbn);
        this.borrowHistory.push({
            isbn,
            bookTitle,
            borrowDate: new Date(),
            returned: false
        });
    }

    removeBorrowedBook(isbn) {
        const index = this.borrowedBooks.indexOf(isbn);
        if (index > -1) this.borrowedBooks.splice(index, 1);

        const historyItem = this.borrowHistory.find(h => h.isbn === isbn && !h.returned);
        if (historyItem) {
            historyItem.returned = true;
            historyItem.returnDate = new Date();
        }
    }

    getBorrowHistory() {
        return this.borrowHistory;
    }

    getFormattedHistory() {
        return this.borrowHistory.map(h =>
            `${h.bookTitle} - ${DateUtils.formatDate(h.borrowDate)}${h.returned ? `, zwrócono: ${DateUtils.formatDate(h.returnDate)}` : ' (aktywne)'}`
        ).join('\n');
    }

    hasOverdueBooks(days) {
        return this.borrowHistory.some(h => !h.returned &&
            DateUtils.getDaysBetween(h.borrowDate, new Date()) > days);
    }
}