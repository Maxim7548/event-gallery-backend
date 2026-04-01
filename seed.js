import { MongoClient } from 'mongodb';

const url = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(url);

async function runSeed() {
    try {
        console.log("Підключення до сервера MongoDB");
        await mongoClient.connect(); 
        
        const db = mongoClient.db("gallery_db"); 
        const eventsCollection = db.collection("events");
        const participantsCollection = db.collection("participants");

        await eventsCollection.deleteMany({});
        await participantsCollection.deleteMany({});

        const events = [
            { 
                title: 'Абстракція: Новий погляд', 
                date: '2026-10-15',
                organizer: 'ArtSpace Kyiv',
                description: 'Відкриття галереї молодих художників. Жива музика.'
            },
            { 
                title: 'Digital Art Week', 
                date: '2026-11-02',
                organizer: 'Future Museum',
                description: 'Презентація цифрових інсталяцій та NFT.'
            },
            { 
                title: 'Скульптура у місті', 
                date: '2026-09-20',
                organizer: 'Urban Hub',
                description: 'Виставка сучасної паркової скульптури.'
            }
        ];

        const eventsResult = await eventsCollection.insertMany(events);
        console.log(`Успішно додано подій: ${eventsResult.insertedCount}`);

        const firstEventId = eventsResult.insertedIds[0];

        const participants = [
            { name: 'Олександр Іванов', email: 'alex@example.com', eventId: firstEventId },
            { name: 'Марія Коваленко', email: 'maria@example.com', eventId: firstEventId }
        ];

        const partsResult = await participantsCollection.insertMany(participants);
        console.log(`Успішно додано учасників: ${partsResult.insertedCount}`);

    } catch (err) {
        console.log("Сталася помилка:", err); 
    } finally {
        await mongoClient.close(); 
        console.log("Підключення закрито.");
    }
}

runSeed();