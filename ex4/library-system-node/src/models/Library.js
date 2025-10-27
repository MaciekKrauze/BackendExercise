import { EventEmitter } from 'node:events';
import { Book } from './Book.js';
import { User } from './User.js';
import { Validator } from './Validator.js';
import { DateUtils } from './DateUtils.js';
import { withTimeout } from '../services/utils.js';

export class Library {
    constructor(name, maxBooksPerUser = 5) {
        this.name = name;
        this.books = [];
        this.users = [];
        this.loans = [];
        this.maxBooksPerUser = maxBooksPerUser;
        this.eventEmitter = new EventEmitter();
        this.eventHistory = [];
    }

    get totalBooks() {
        return this.books.reduce((sum, book) => sum + book.totalCopies, 0);
    }

    get availableBooks() {
        return this.books.reduce((sum, book) => sum + book.availableCopies, 0);
    }

    get statistics() {
        return {
            totalBooks: this.totalBooks,
            availableBooks: this.availableBooks,
            borrowedBooks: this.totalBooks - this.availableBooks,
            totalUsers: this.users.length,
            activeLoans: this.loans.length,
            uniqueTitles: this.books.length
        };
    }

    _recordEvent(type, data) {
        const event = { type, data, timestamp: new Date() };
        this.eventHistory.push(event);

        if (this.eventHistory.length > 50) {
            this.eventHistory.shift();
        }

        this.eventEmitter.emit(type, data);
    }

    on(eventName, handler) {
        this.eventEmitter.on(eventName, handler);
    }

    getEventHistory(limit = 10) {
        return this.eventHistory.slice(-limit);
    }

    getEventStats() {
        if (this.eventHistory.length === 0) {
            return {
                eventCounts: {},
                totalEvents: 0,
                lastEvent: null,
                firstEventTime: null,
                lastEventTime: null
            };
        }

        const eventCounts = {};
        this.eventHistory.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });

        return {
            eventCounts,
            totalEvents: this.eventHistory.length,
            lastEvent: this.eventHistory[this.eventHistory.length - 1],
            firstEventTime: this.eventHistory[0].timestamp,
            lastEventTime: this.eventHistory[this.eventHistory.length - 1].timestamp
        };
    }

    addBook(bookData) {
        const {
            title,
            author,
            isbn,
            publicationYear,
            totalCopies = 1,
            borrowedCopies = 0,
            genre = "Inne"
        } = bookData;

        if (!Book.isValidBook({ isbn, publicationYear, totalCopies })) {
            throw new Error('Nieprawidłowe dane książki');
        }

        const book = new Book(title, author, isbn, publicationYear, totalCopies, borrowedCopies, genre);
        this.books.push(book);
        this._recordEvent('book:added', { book, timestamp: new Date() });
        return book;
    }

    findBookByISBN(isbn) {
        return this.books.find(b => b.isbn === isbn);
    }

    findBooksByAuthor(author) {
        return this.books.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    }

    findBooksByGenre(genre) {
        return this.books.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
    }

    registerUser(userData) {
        const { name, email, registrationDate = new Date() } = userData;

        if (!Validator.isValidEmail(email)) {
            throw new Error('Nieprawidłowy email');
        }
        if (this.findUserByEmail(email)) {
            throw new Error('Użytkownik już istnieje');
        }

        const user = new User(name, email, registrationDate);
        this.users.push(user);
        this._recordEvent('user:registered', { user, timestamp: new Date() });
        return user;
    }

    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    borrowBook(userEmail, isbn) {
        const user = this.findUserByEmail(userEmail);
        const book = this.findBookByISBN(isbn);

        if (!user) throw new Error('Nie znaleziono użytkownika');
        if (!book) throw new Error('Nie znaleziono książki');
        if (!user.canBorrow) throw new Error('Limit wypożyczeń');
        if (!book.isAvailable) throw new Error('Książka niedostępna');

        book.borrow();
        user.addBorrowedBook(isbn, book.title);

        const loan = {
            userEmail,
            isbn,
            bookTitle: book.title,
            borrowDate: new Date(),
            dueDate: DateUtils.addDays(new Date(), 30)
        };
        this.loans.push(loan);
        this._recordEvent('loan:created', { userEmail, isbn, bookTitle: book.title, timestamp: new Date() });
        return loan;
    }

    returnBook(userEmail, isbn) {
        const user = this.findUserByEmail(userEmail);
        const book = this.findBookByISBN(isbn);

        if (!user || !book) throw new Error('Nie znaleziono');

        const bookTitle = book.title;
        book.return();
        user.removeBorrowedBook(isbn);

        const loanIndex = this.loans.findIndex(l => l.userEmail === userEmail && l.isbn === isbn);
        if (loanIndex > -1) this.loans.splice(loanIndex, 1);

        this._recordEvent('loan:returned', { userEmail, isbn, bookTitle, timestamp: new Date() });
        return true;
    }

    generateReport() {
        const stats = this.statistics;
        return `RAPORT: ${this.name}\nData: ${DateUtils.formatDate(new Date())}\n\nTytułów: ${stats.uniqueTitles}\nEgzemplarzy: ${stats.totalBooks}\nDostępne: ${stats.availableBooks}\nWypożyczone: ${stats.borrowedBooks}\nUżytkowników: ${stats.totalUsers}\nAktywne wypożyczenia: ${stats.activeLoans}`;
    }

    // Promise.all
    async initializeFromData(booksData, usersData) {
        let addedBooks = 0, addedUsers = 0;
        let failedBooks = 0, failedUsers = 0;

        const bookPromises = booksData.map(bookData =>
            Promise.resolve()
                .then(() => this.addBook(bookData))
                .then(() => { addedBooks++; })
                .catch(() => { failedBooks++; })
        );

        const userPromises = usersData.map(userData =>
            Promise.resolve()
                .then(() => this.registerUser(userData))
                .then(() => { addedUsers++; })
                .catch(() => { failedUsers++; })
        );

        await Promise.all([...bookPromises, ...userPromises]);
        return { addedBooks, addedUsers, failedBooks, failedUsers };
    }

    // Promise.race
    async saveWithTimeout(dataManager, timeoutMs = 5000) {
        return withTimeout(dataManager.saveLibrary(this), timeoutMs, 'Zapis biblioteki');
    }

    // Promise.any
    async findBookFromMultipleSources(isbn) {
        const searchLocal = async () => {
            const book = this.findBookByISBN(isbn);
            if (book) return { book, source: 'local' };
            throw new Error('Not in local');
        };

        const searchCache = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (Math.random() > 0.2) {
                const book = this.findBookByISBN(isbn);
                if (book) return { book, source: 'cache' };
            }
            throw new Error('Not in cache');
        };

        const searchAPI = async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (Math.random() > 0.5) {
                const book = this.findBookByISBN(isbn);
                if (book) return { book, source: 'api' };
            }
            throw new Error('API failed');
        };

        try {
            return await Promise.any([searchLocal(), searchCache(), searchAPI()]);
        } catch {
            return null;
        }
    }
}