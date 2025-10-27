import { Library } from './src/models/Library.js';
import { DataManager } from './src/services/DataManager.js';

async function main() {
    console.log('=== Test Systemu Biblioteki z Node.js ===\n');

    const library = new Library('Biblioteka Główna');

    library.on('book:added', (data) => {
        console.log(`✓ Zdarzenie: Dodano "${data.book.title}"`);
    });

    library.on('user:registered', (data) => {
        console.log(`✓ Zdarzenie: Zarejestrowano użytkownika "${data.user.name}"`);
    });

    library.on('loan:created', (data) => {
        console.log(`✓ Zdarzenie: Wypożyczono "${data.bookTitle}" dla ${data.userEmail}`);
    });

    library.on('loan:returned', (data) => {
        console.log(`✓ Zdarzenie: Zwrócono "${data.bookTitle}" od ${data.userEmail}`);
    });

    console.log('--- Test: Inicjalizacja równoległa (Promise.all) ---');
    const sampleBooks = [
        { title: 'Wiedźmin', author: 'Andrzej Sapkowski', isbn: '1234567890123', publicationYear: 1990, totalCopies: 3, genre: 'Fantasy' },
        { title: '1984', author: 'George Orwell', isbn: '1234567890124', publicationYear: 1949, totalCopies: 5, genre: 'Dystopia' },
        { title: 'Hobbit', author: 'J.R.R. Tolkien', isbn: '1234567890125', publicationYear: 1937, totalCopies: 4, genre: 'Fantasy' }
    ];

    const sampleUsers = [
        { name: 'Jan Kowalski', email: 'jan@email.com' },
        { name: 'Anna Nowak', email: 'anna@email.com' },
        { name: 'Piotr Wiśniewski', email: 'piotr@email.com' }
    ];

    const initResult = await library.initializeFromData(sampleBooks, sampleUsers);
    console.log('Wynik inicjalizacji:', initResult);

    console.log('\n--- Test: Historia zdarzeń ---');
    const history = library.getEventHistory(5);
    console.log('Ostatnie zdarzenia:', history.map(e => e.type));

    console.log('\n--- Test: Wypożyczenia ---');
    library.borrowBook('jan@email.com', '1234567890123');
    library.borrowBook('anna@email.com', '1234567890124');

    console.log('\n--- Test: Persystencja (fs/promises) ---');
    const dataManager = new DataManager();
    const saveResult = await dataManager.saveLibrary(library);
    console.log('✓ Zapisano:', saveResult);

    const loadedData = await dataManager.loadLibrary();
    console.log('✓ Wczytano:', { books: loadedData.books.length, users: loadedData.users.length });

    console.log('\n--- Test: Timeout (Promise.race) ---');
    await library.saveWithTimeout(dataManager, 10000);
    console.log('✓ Zapis zakończony w czasie');

    console.log('\n--- Test: Promise.any ---');
    for (let i = 0; i < 3; i++) {
        const result = await library.findBookFromMultipleSources('1234567890123');
        console.log(`Próba ${i + 1}: ${result ? `Znaleziono w "${result.source}"` : 'Nie znaleziono'}`);
    }

    console.log('\n--- Podsumowanie ---');
    console.log(library.generateReport());
}

main().catch(console.error);