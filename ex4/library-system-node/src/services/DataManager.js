import fs from 'node:fs/promises';
import path from 'node:path';

export class DataManager {
    constructor(dataFolder = './data') {
        this.dataFolder = dataFolder;
    }

    async saveLibrary(library) {
        try {
            await fs.mkdir(this.dataFolder, { recursive: true });

            const booksData = library.books;
            const usersData = library.users;
            const loansData = library.loans;

            await Promise.all([
                fs.writeFile(
                    path.join(this.dataFolder, 'books.json'),
                    JSON.stringify(booksData, null, 2),
                    'utf8'
                ),
                fs.writeFile(
                    path.join(this.dataFolder, 'users.json'),
                    JSON.stringify(usersData, null, 2),
                    'utf8'
                ),
                fs.writeFile(
                    path.join(this.dataFolder, 'loans.json'),
                    JSON.stringify(loansData, null, 2),
                    'utf8'
                )
            ]);

            return {
                booksCount: booksData.length,
                usersCount: usersData.length,
                loansCount: loansData.length
            };
        } catch (error) {
            throw new Error(`Błąd zapisu danych: ${error.message}`);
        }
    }

    async loadLibrary() {
        const loadFile = async (filename) => {
            try {
                const filePath = path.join(this.dataFolder, filename);
                const content = await fs.readFile(filePath, 'utf8');
                return JSON.parse(content);
            } catch (error) {
                return [];
            }
        };

        try {
            const [books, users, loans] = await Promise.all([
                loadFile('books.json'),
                loadFile('users.json'),
                loadFile('loans.json')
            ]);

            return { books, users, loans };
        } catch (error) {
            return { books: [], users: [], loans: [] };
        }
    }

    async clearAllData() {
        try {
            const files = ['books.json', 'users.json', 'loans.json'];
            let deletedCount = 0;

            for (const file of files) {
                try {
                    await fs.unlink(path.join(this.dataFolder, file));
                    deletedCount++;
                }
                catch (error) {}
            }

            return deletedCount;
        } catch (error) {
            throw new Error(`Błąd usuwania danych: ${error.message}`);
        }
    }
}