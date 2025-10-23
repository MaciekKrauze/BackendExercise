String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}
String.prototype.truncate = function (length) {
    return this.length > length ? this.slice(0, length) + '...' : this.toString();
}

Array.prototype.myEvery = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (!callback(this[i], i, this)) return false;
    }
    return true;
};
Array.prototype.myFilter = function (callback) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (callback(this[i], i, this)) result.push(this[i]);
    }
    return result;
};
Array.prototype.groupBy = function (key) {
    return this.reduce((acc, item) => {
        const k = typeof key === 'function' ? key(item) : item[key];
        (acc[k] = acc[k] || []).push(item);
        return acc;
    }, {});
};
Array.prototype.unique = function () {
    return [...new Set(this)];
};

class DateUtils {
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    static getDaysBetween(date1, date2) {
        return Math.ceil(Math.abs(new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
    }
    static formatDate(date) {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

class Validator {
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

class Book {
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

    set copies({ total, borrowed }) {
        if (total !== undefined) this.totalCopies = total;
        if (borrowed !== undefined) this.borrowedCopies = borrowed;
    }

    set details({ title, author, genre }) {
        if (title) this.title = title;
        if (author) this.author = author;
        if (genre) this.genre = genre;
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

class User {
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

    set info({ name, email }) {
        if (name) this.name = name;
        if (email) this.email = email;
    }

    addBorrowedBook(isbn, bookTitle) {
        this.borrowedBooks.push(isbn);
        this.borrowHistory.push({ isbn, bookTitle, borrowDate: new Date(), returned: false });
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
}

User.prototype.getFormattedHistory = function () {
    return this.borrowHistory.map(h =>
        `${h.bookTitle} - ${DateUtils.formatDate(h.borrowDate)}${h.returned ? `, zwrócono: ${DateUtils.formatDate(h.returnDate)}` : ' (aktywne)'}`
    ).join('\n');
}

User.prototype.hasOverdueBooks = function (days) {
    return this.borrowHistory.some(h => !h.returned &&
        DateUtils.getDaysBetween(h.borrowDate, new Date()) > days);
};

class AsyncDatabase {
    constructor(delay = 500) {
        this.delay = delay;
        this.data = new Map();
    }

    save(key, value) {
        return new Promise((resolve, reject) => {
            const actualDelay = Math.random() < 0.1 ? this.delay * 2 : this.delay;
            setTimeout(() => {
                this.data.set(key, value);
                resolve(value);
            }, actualDelay);
        });
    }

    get(key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.data.has(key) ? this.data.get(key) : null);
            }, this.delay);
        });
    }

    delete(key) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const result = this.data.delete(key);
                resolve(result);
            }, this.delay);
        });
    }

    getAll() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.data.values()));
            }, this.delay);
        });
    }

    clear() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const count = this.data.size;
                this.data.clear();
                resolve(count);
            }, this.delay);
        });
    }
}

class Library {
    constructor(name, maxBooksPerUser = 5) {
        this.name = name;
        this.books = [];
        this.users = [];
        this.loans = [];
        this.maxBooksPerUser = maxBooksPerUser;
        this.database = new AsyncDatabase();
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
        return book;
    }

    removeBook(isbn) {
        const index = this.books.findIndex(b => b.isbn === isbn);
        if (index > -1) {
            this.books.splice(index, 1);
            return true;
        }
        return false;
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

    updateBook(isbn, updates) {
        const book = this.findBookByISBN(isbn);
        if (book) {
            Object.assign(book, updates);
            return true;
        }
        return false;
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
        return user;
    }

    removeUser(email) {
        const index = this.users.findIndex(u => u.email === email);
        if (index > -1) {
            this.users.splice(index, 1);
            return true;
        }
        return false;
    }

    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    updateUser(email, updates) {
        const user = this.findUserByEmail(email);
        if (user) {
            Object.assign(user, updates);
            return true;
        }
        return false;
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
        return loan;
    }

    returnBook(userEmail, isbn) {
        const user = this.findUserByEmail(userEmail);
        const book = this.findBookByISBN(isbn);

        if (!user || !book) throw new Error('Nie znaleziono');

        book.return();
        user.removeBorrowedBook(isbn);

        const loanIndex = this.loans.findIndex(l => l.userEmail === userEmail && l.isbn === isbn);
        if (loanIndex > -1) this.loans.splice(loanIndex, 1);

        return true;
    }

    getUserLoans(userEmail) {
        return this.loans.filter(l => l.userEmail === userEmail);
    }

    getOverdueLoans(days = 30) {
        return this.loans.filter(l => DateUtils.getDaysBetween(l.borrowDate, new Date()) > days);
    }

    getPopularBooks(limit = 5) {
        return this.books
            .map(book => ({ book, count: book.borrowedCopies }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
            .map(item => item.book);
    }

    getActiveUsers(limit = 5) {
        return this.users
            .sort((a, b) => b.borrowHistory.length - a.borrowHistory.length)
            .slice(0, limit);
    }

    generateReport() {
        const stats = this.statistics;
        return `RAPORT: ${this.name}\nData: ${DateUtils.formatDate(new Date())}\n\nTytułów: ${stats.uniqueTitles}\nEgzemplarzy: ${stats.totalBooks}\nDostępne: ${stats.availableBooks}\nWypożyczone: ${stats.borrowedBooks}\nUżytkowników: ${stats.totalUsers}\nAktywne wypożyczenia: ${stats.activeLoans}`;
    }

    async addBookAsync(bookData) {
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
        await this.database.save(`book_${isbn}`, book);
        this.books.push(book);
        return book;
    }

    async getBookAsync(isbn) {
        const book = await this.database.get(`book_${isbn}`);
        return book;
    }

    async removeBookAsync(isbn) {
        const book = await this.getBookAsync(isbn);
        if (!book) return false;

        if (book.borrowedCopies > 0) {
            throw new Error('Nie można usunąć wypożyczonej książki');
        }

        await this.database.delete(`book_${isbn}`);
        const index = this.books.findIndex(b => b.isbn === isbn);
        if (index > -1) this.books.splice(index, 1);
        return true;
    }

    async registerUserAsync(userData) {
        const { name, email, registrationDate = new Date() } = userData;

        if (!Validator.isValidEmail(email)) {
            throw new Error('Nieprawidłowy email');
        }

        const existingUser = await this.getUserAsync(email);
        if (existingUser) {
            throw new Error('Użytkownik już istnieje');
        }

        const user = new User(name, email, registrationDate);
        await this.database.save(`user_${email}`, user);
        this.users.push(user);
        return user;
    }

    async getUserAsync(email) {
        const user = await this.database.get(`user_${email}`);
        return user;
    }

    async borrowBookAsync(userEmail, isbn) {
        const [book, user] = await Promise.all([
            this.getBookAsync(isbn),
            this.getUserAsync(userEmail)
        ]);

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

        await Promise.all([
            this.database.save(`book_${isbn}`, book),
            this.database.save(`user_${userEmail}`, user),
            this.database.save(`loan_${userEmail}_${isbn}`, loan)
        ]);

        this.loans.push(loan);
        return loan;
    }

    async returnBookAsync(userEmail, isbn) {
        const [book, user] = await Promise.all([
            this.getBookAsync(isbn),
            this.getUserAsync(userEmail)
        ]);

        if (!user || !book) throw new Error('Nie znaleziono');

        book.return();
        user.removeBorrowedBook(isbn);

        await Promise.all([
            this.database.save(`book_${isbn}`, book),
            this.database.save(`user_${userEmail}`, user),
            this.database.delete(`loan_${userEmail}_${isbn}`)
        ]);

        const loanIndex = this.loans.findIndex(l => l.userEmail === userEmail && l.isbn === isbn);
        if (loanIndex > -1) this.loans.splice(loanIndex, 1);

        return true;
    }

    async initializeLibraryAsync(booksData, usersData) {
        const bookPromises = booksData.map(bookData => this.addBookAsync(bookData));
        const userPromises = usersData.map(userData => this.registerUserAsync(userData));

        const [books, users] = await Promise.all([
            Promise.all(bookPromises),
            Promise.all(userPromises)
        ]);

        return {
            books,
            users,
            total: books.length + users.length
        };
    }

    async getMultipleBooksAsync(isbns) {
        const bookPromises = isbns.map(isbn => this.getBookAsync(isbn));
        const books = await Promise.all(bookPromises);
        return books.filter(book => book !== null);
    }

    async batchBorrowBooksAsync(userEmail, isbns) {
        const borrowPromises = isbns.map(isbn => this.borrowBookAsync(userEmail, isbn));
        return await Promise.all(borrowPromises);
    }
}

function createTimeout(ms, errorMessage) {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error(errorMessage)), ms);
    });
}

async function searchWithTimeout(searchFunction, timeoutMs = 3000) {
    return await Promise.race([
        searchFunction(),
        createTimeout(timeoutMs, 'Przekroczono limit czasu wyszukiwania')
    ]);
}

async function getFastestResult(operations) {
    return await Promise.race(operations);
}

async function findBookAnywhere(isbn) {
    const searchLocalStorage = () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, 800);
        });
    };

    const searchDatabase = (db) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(db.get(`book_${isbn}`));
            }, 600);
        });
    };

    const searchExternalAPI = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.5) {
                    resolve(null);
                } else {
                    reject(new Error('API niedostępne'));
                }
            }, 1000);
        });
    };

    try {
        const book = await Promise.any([
            searchLocalStorage().then(b => b ? { book: b, source: 'localStorage' } : Promise.reject()),
            searchDatabase(new AsyncDatabase()).then(b => b ? { book: b, source: 'database' } : Promise.reject()),
            searchExternalAPI().then(b => b ? { book: b, source: 'externalAPI' } : Promise.reject())
        ]);
        return book;
    } catch {
        return null;
    }
}

async function verifyUserInMultipleSystems(email) {
    const verifySystem1 = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.3 ? resolve(true) : reject(new Error('System 1 błąd'));
            }, 500);
        });
    };

    const verifySystem2 = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.3 ? resolve(true) : reject(new Error('System 2 błąd'));
            }, 700);
        });
    };

    const verifySystem3 = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                Math.random() > 0.3 ? resolve(true) : reject(new Error('System 3 błąd'));
            }, 600);
        });
    };

    try {
        await Promise.any([verifySystem1(), verifySystem2(), verifySystem3()]);
        return true;
    } catch {
        return false;
    }
}

function swapElements([el1, el2]) {
    return [el2, el1];
}

function mergeArrays(...arrays) {
    return [].concat(...arrays);
}

function uniqueValues(array) {
    return [...new Set(array)];
}

function extendObject(obj1, obj2) {
    return { ...obj1, ...obj2 };
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function pickProperties(obj, keys) {
    return keys.reduce((result, key) => {
        if (key in obj) result[key] = obj[key];
        return result;
    }, {});
}

function createBook({ title, author, isbn, publicationYear, totalCopies = 1, genre = "Inne" }) {
    return { title, author, isbn, publicationYear, totalCopies, borrowedCopies: 0, genre };
}

function createUser({ name, email, registrationDate = new Date() }) {
    return { name, email, registrationDate };
}

function createLoan({ userEmail, isbn, borrowDate = new Date(), dueDate }) {
    return { userEmail, isbn, borrowDate, dueDate: dueDate || DateUtils.addDays(borrowDate, 30) };
}

function sortBooksByYear(books, order = 'asc') {
    return [...books].sort((a, b) =>
        order === 'asc' ? a.publicationYear - b.publicationYear : b.publicationYear - a.publicationYear
    );
}

function filterAvailableBooks(books) {
    return books.filter(book => book.isAvailable);
}

function groupBooksByGenre(books) {
    return books.groupBy('genre');
}

function calculateStatistics(books, users, loans) {
    const genres = groupBooksByGenre(books);
    const genreEntries = Object.entries(genres);
    return {
        totalBooks: books.reduce((sum, b) => sum + b.totalCopies, 0),
        totalxUsers: users.length,
        activeLoans: loans.length,
        averageBooksPerUser: users.length > 0 ?
            (users.reduce((sum, u) => sum + u.borrowCount, 0) / users.length).toFixed(2) : 0,
        mostPopularGenre: genreEntries.length > 0 ?
            genreEntries.reduce((max, curr) => curr[1].length > max[1].length ? curr : max)[0] : 'Brak'
    };
}

// Przykład użycia
async function demonstrateLibrarySystem() {
    const library = new Library("Biblioteka Miejska");

    console.log('1. Dodawanie książek (synchroniczne)');
    library.addBook({
        title: "Wiedźmin",
        author: "Andrzej Sapkowski",
        isbn: "9788375780635",
        publicationYear: 1990,
        totalCopies: 3,
        genre: "Fantasy"
    });

    library.addBook({
        title: "Pan Tadeusz",
        author: "Adam Mickiewicz",
        isbn: "9788328700826",
        publicationYear: 1834,
        totalCopies: 2,
        genre: "Poezja"
    });

    console.log(library.generateReport());

    console.log('\n\n2. Inicjalizacja asynchroniczna');
    const booksData = [
        { title: "Hobbit", author: "J.R.R. Tolkien", isbn: "9788324631766", publicationYear: 1937, totalCopies: 5, genre: "Fantasy" },
        { title: "1984", author: "George Orwell", isbn: "9788328700123", publicationYear: 1949, totalCopies: 3, genre: "Dystopia" }
    ];

    const usersData = [
        { name: "Jan Kowalski", email: "jan@example.com" },
        { name: "Anna Nowak", email: "anna@example.com" }
    ];

    try {
        const result = await library.initializeLibraryAsync(booksData, usersData);
        console.log(`Dodano: ${result.books.length} książek, ${result.users.length} użytkowników`);

        console.log('\n3. Wypożyczenie książki (async)');
        const loan = await library.borrowBookAsync("jan@example.com", "9788324631766");
        console.log(`Wypożyczono: ${loan.bookTitle} dla ${loan.userEmail}`);

        console.log('\n4. Pobieranie wielu książek (Promise.all)');
        const books = await library.getMultipleBooksAsync(["9788324631766", "9788328700123"]);
        console.log(`Pobrano ${books.length} książek z bazy danych`);

        console.log('\n5. Wyszukiwanie z timeoutem (Promise.race)');
        const fastSearch = async () => {
            return await library.getBookAsync("9788324631766");
        };
        const searchResult = await searchWithTimeout(fastSearch, 2000);
        console.log(`Znaleziono: ${searchResult ? searchResult.title : 'Brak'}`);

        console.log('\n6. Weryfikacja użytkownika (Promise.any)');
        const isVerified = await verifyUserInMultipleSystems("jan@example.com");
        console.log(`Użytkownik zweryfikowany: ${isVerified}`);

        console.log(library.generateReport());
        console.log("\nStatystyki:", calculateStatistics(library.books, library.users, library.loans));
    } catch (error) {
        console.error('Błąd:', error.message);
    }
}
demonstrateLibrarySystem();