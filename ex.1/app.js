String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}
String.prototype.truncate = function (length){
    return this.length > length ? this.slice(0, length) + '...' : this.toString();
}

Array.prototype.myEvery = function(callback) {
    for (let i = 0; i < this.length; i++) {
        if (!callback(this[i], i, this)) return false;
    }
    return true;
};
Array.prototype.myFilter = function(callback) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (callback(this[i], i, this)) result.push(this[i]);
    }
    return result;
};
Array.prototype.groupBy = function(key) {
    return this.reduce((acc, item) => {
        const k = typeof key === 'function' ? key(item) : item[key];
        (acc[k] = acc[k] || []).push(item);
        return acc;
    }, {});
};
Array.prototype.unique = function() {
    return [...new Set(this)];
};

class DateUtils {
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    getDaysBetween (date1, date2){
        return Math.ceil(Math.abs(new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24));
    }
    formatDate(date){
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
    addDays(date, days){
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}

class Validator {
    isValidISBN(isbn){
        return /^\d{13}$/.test(isbn);
    }
    isValidEmail(email){
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    isValidYear(year){
        return year > 1000 && year < new Date().getFullYear();
    }
    isValidPageCount(pages){
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
        this.genre = genre;
    }
    availableCopies(){
        return this.totalCopies - this.borrowedCopies;
    }
    isAvailable(){
        return this.availableCopies > 0;
    }
    info(){
        return this.title + " " + this.author + " " + this.publicationYear + " " + this.genre + " " + this.genre +  this.isbn;
    }
    age(){
        const year = new Date().getFullYear();
        return year - this.publicationYear;
    }

    set copies ({total, borrowed}){
        if (total) this.totalCopies = total;
        if (borrowed) this.publicationYear = borrowed;
    }
    set details ({title, author, genre}){
        if (title) this.title = title;
        if (author) this.author = author;
        if (genre) this.genre = genre;
    }

    borrow(){
        if (this.isAvailable) this.borrowedCopies++;
    }
    return(){
        if (!(this.borrowedCopies === 0)) this.borrowedCopies--;
    }
    getFormattedInfo(){
        return this.info();
    }

    static isValidBook(bookData){
        let validator = new Validator();
        if (validator.isValidEmail(bookData.isbn) && validator.isValidYear(bookData.year)){
            return true;
        }
    }
    static compareByYear(book1, book2) {
        return book1.publicationYear - book2.publicationYear;
    }
}

class User {
    constructor(name, email, registrationDate = new Date()) {
        this.name = name;
        this.email = email;
        this.registrationDate = new Date();
        this.borrowedBooks = [];
        this.borrowHistory = [];
    }
    canBorrow(){
        return this.borrowedBooks <= 5 && this.borrowedBooks > 0;
    }
    borrowCount(){
        return this.borrowedBooks.length;
    }
    profile(){
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

    //???
    addBorrowedBook(isbn, bookTitle){
        this.borrowedBooks.push(isbn);
        this.borrowHistory.push({isbn, bookTitle, borrowDate: new Date(), returned: false});
    }
    removeBorrowedBook(isbn){
        const index = this.borrowedBooks.indexOf(isbn);
        if (index > -1) this.borrowedBooks.splice(index, 1);
        const historyItem = this.borrowHistory.find(h => h.isbn === isbn && !h.returned);
        if (historyItem) {
            historyItem.returned = true;
            historyItem.returnDate = new Date();
        }
    }
    getBorrowHistory(){
        return this.borrowHistory;
    }
}

User.prototype.getFormattedHistory = function (){
    return this.borrowHistory.map(h =>
        `${h.bookTitle} - ${DateUtils.formatDate(h.borrowDate)}${h.returned ? `, zwrócono:
         ${DateUtils.formatDate(h.returnDate)}` : ' (aktywne)'}`).join('\n');
}
User.prototype.hasOverdueBooks = function(days) {
    return this.borrowHistory.some(h => !h.returned &&
        DateUtils.getDaysBetween(h.borrowDate, new Date()) > days);
};

class Library {
    constructor(name, maxBooksPerUser = 5) {
        this.name = name;
        this.books = [];
        this.users = [];
        this.loans = [];
        this.maxBooksPerUser = maxBooksPerUser;
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
        if (!Book.isValidBook({isbn, publicationYear, totalCopies})) throw new Error('Nieprawidłowe dane');
        const book = new Book(title, author, isbn, publicationYear, totalCopies, borrowedCopies, genre);
        this.books.push(book);
        return book;
    }

    removeBook(isbn) {
        const index = this.books.findIndex(b => b.isbn === isbn);
        return index > -1 ? (this.books.splice(index, 1), true) : false;
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
        return book ? (Object.assign(book, updates), true) : false;
    }

    registerUser(userData) {
        const {name, email, registrationDate = new Date()} = userData;
        if (!Validator.isValidEmail(email)) throw new Error('Nieprawidłowy email');
        if (this.findUserByEmail(email)) throw new Error('Użytkownik już istnieje');
        const user = new User(name, email, registrationDate);
        this.users.push(user);
        return user;
    }

    removeUser(email) {
        const index = this.users.findIndex(u => u.email === email);
        return index > -1 ? (this.users.splice(index, 1), true) : false;
    }

    findUserByEmail(email) {
        return this.users.find(u => u.email === email);
    }

    updateUser(email, updates) {
        const user = this.findUserByEmail(email);
        return user ? (Object.assign(user, updates), true) : false;
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
            dueDate: DateUtils.addDays(new Date(), 30)};
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
        return this.books.map(book =>
            ({book, count: book.borrowedCopies})).sort((a, b) =>
            b.count - a.count).slice(0, limit).map(item => item.book);
    }

    getActiveUsers(limit = 5) {
        return this.users.sort((a, b) => b.borrowHistory.length - a.borrowHistory.length).slice(0, limit);
    }

    generateReport() {
        const stats = this.statistics;
        return `RAPORT: ${this.name}\nData: ${DateUtils.
        formatDate(new Date())}\n\nTytułów: ${stats.uniqueTitles}\nEgzemplarzy: 
        ${stats.totalBooks}\nDostępne: ${stats.availableBooks}\nWypożyczone:
         ${stats.borrowedBooks}\nUżytkowników: ${stats.totalUsers}\nAktywne wypożyczenia: ${stats.activeLoans}`;
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
    return {...obj1, ...obj2};
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function pickProperties(obj, keys) {
    return keys.reduce((result, key) => (key in obj && (result[key] = obj[key]), result), {});
}

function createBook({title, author, isbn, publicationYear, totalCopies = 1, genre = "Inne"}) {
    return {title, author, isbn, publicationYear, totalCopies, borrowedCopies: 0, genre};
}

function createUser({name, email, registrationDate = new Date()}) {
    return {name, email, registrationDate};
}

function createLoan({userEmail, isbn, borrowDate = new Date(), dueDate}) {
    return {userEmail, isbn, borrowDate, dueDate: dueDate || DateUtils.addDays(borrowDate, 30)};
}

function sortBooksByYear(books, order = 'asc') {
    return [...books].sort((a, b) => order === 'asc' ? a.publicationYear - b.publicationYear : b.publicationYear - a.publicationYear);
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
        totalUsers: users.length,
        activeLoans: loans.length,
        averageBooksPerUser: users.length > 0 ? (users.reduce((sum, u) => sum + u.borrowCount, 0) / users.length).toFixed(2) : 0,
        mostPopularGenre: genreEntries.length > 0 ?
            genreEntries.reduce((max, curr) => curr[1].length > max[1].length ? curr : max)[0] : 'Brak'
    };
}