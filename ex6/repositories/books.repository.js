let books = [
    {
        isbn: '1234567890123',
        title: 'title',
        author: 'Author',
        year: 1500,
        genre: 'Fantasy',
        availableCopies: 30
    },
    {
        isbn: '1234567890124',
        title: 'title1',
        author: 'Author1',
        year: 1501,
        genre: 'Fantasy',
        availableCopies: 30
    },
    {
        isbn: '1234567890125',
        title: 'title2',
        author: 'Author2',
        year: 1502,
        genre: 'Fantasy',
        availableCopies: 30
    },
    {
        isbn: '1234567890126',
        title: 'title3',
        author: 'Author3',
        year: 1503,
        genre: 'Fantasy',
        availableCopies: 30
    },
]

function findAll(){
    return books;
}

function findByIsbn(isbn){
    return books.find(book => book.isbn === isbn) || null;
}

function create (book){
    books.push(book);
    return book;
}

function update (isbn, bookData){
    let book = findByIsbn(isbn);
    if (book){
        if (bookData.title !== undefined) book.title = bookData.title;
        if (bookData.author !== undefined) book.author = bookData.author;
        if (bookData.year !== undefined) book.year = bookData.year;
        if (bookData.genre !== undefined) book.genre = bookData.genre;
        if (bookData.availableCopies !== undefined) book.availableCopies = bookData.availableCopies;
    }
    return book;
}

function deleteByIsbn(isbn) {
    const index = books.findIndex(book => book.isbn === isbn);
    if (index === -1) return false;

    books.splice(index, 1);
    return true;
}

function exists (isbn){
    let book = findByIsbn(isbn);
    return !!book;
}

module.exports = {
    findAll,
    findByIsbn,
    create,
    update,
    deleteByIsbn,
    exists
}