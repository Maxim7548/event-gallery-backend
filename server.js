import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import mongoose from 'mongoose';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { GraphQLError } from 'graphql';
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 

import { User } from './models/User.js';
import { Event } from './models/Event.js';
import { Participant } from './models/Participant.js';
import { Message } from './models/Message.js';

const app = express();
const PORT = 3000;
const MONGO_URL = "mongodb+srv://maksimmartynov705_db_user:Maksim2026@cluster0.a3hjxqd.mongodb.net/gallery_db?appName=Cluster0";
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'https://prak-front-end.vercel.app'],
        credentials: true
    }
});

io.on('connection', async (socket) => {
    try {
        const history = await Message.find().sort({ createdAt: 1 }).limit(50);
        socket.emit('chatHistory', history);
    } catch (err) {
        console.error(err);
    }
    
    socket.on('sendMessage', async (data) => {
        try {
            const newMessage = new Message({
                text: data.text,
                time: data.time,
                id: data.id
            });
            await newMessage.save();
            io.emit('receiveMessage', data); 
        } catch (err) {
            console.error(err);
        }
    });
});

mongoose.connect(MONGO_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error(err));

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://prak-front-end.vercel.app'],
    credentials: true
}));

app.use(session({
    secret: 'super_secret_gallery_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, 
        maxAge: 1000 * 60 * 60
    }
}));

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Не авторизовано" });
    }
    next();
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.status(403).json({ message: "Доступ заборонено" });
        }
        next();
    };
};

app.post('/register', async (req, res) => {
    try {
        const { email, password, role = 'organizer' } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Введіть дані' });
        }

        const candidate = await User.findOne({ email });
        if (candidate) {
            return res.status(400).json({ message: 'Користувач існує' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: `Створено` });
    } catch (err) {
        res.status(500).json({ message: 'Помилка' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'Не знайдено' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Невірний пароль' });
        }

        req.session.user = { id: user._id.toString(), email: user.email, role: user.role };
        res.json({ message: 'Вхід виконано', user: req.session.user });
    } catch (err) {
        res.status(500).json({ message: 'Помилка' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Помилка' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Ви вийшли' });
    });
});

app.post('/events', requireAuth, async (req, res) => {
    try {
        const { title, description, date } = req.body;
        const newEvent = new Event({
            title,
            description,
            date,
            creator: req.session.user.id
        });
        await newEvent.save();
        res.status(201).json({ message: 'Створено', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Помилка', error });
    }
});

app.put('/events/:id', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        
        if (!event) return res.status(404).json({ message: 'Не знайдено' });

        if (event.creator.toString() !== req.session.user.id) {
            return res.status(403).json({ message: 'Заборонено' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(eventId, req.body, { new: true });
        res.json({ message: 'Оновлено', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Помилка', error });
    }
});

app.delete('/events/:id', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        
        if (!event) return res.status(404).json({ message: 'Не знайдено' });

        if (event.creator.toString() !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ message: 'Заборонено' });
        }

        await Event.findByIdAndDelete(eventId);
        res.json({ message: 'Видалено' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка', error });
    }
});

app.get('/events', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sort || 'title';
        const sortOrder = req.query.order === 'desc' ? -1 : 1;

        if (page < 1 || limit < 1) {
            return res.status(400).json({ error: "Помилка пагінації" });
        }

        const total = await Event.countDocuments();
        const data = await Event.find()
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({ total, page, limit, data });
    } catch (err) {
        res.status(500).json({ error: "Помилка" });
    }
});

app.get('/events/scroll', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 2; 
        const cursor = req.query.cursor;

        let query = {};
        if (cursor) {
            query = { _id: { $lt: cursor } };
        }

        const data = await Event.find(query)
            .sort({ _id: -1 }) 
            .limit(limit);

        res.json({ data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: "Помилка пагінації" });
    }
});

app.post('/participants', async (req, res) => {
    try {
        const { name, email, eventId } = req.body;
        const newParticipant = new Participant({ name, email, eventId });
        await newParticipant.save();
        res.status(201).json({ message: 'Зареєстровано', participant: newParticipant });
    } catch (error) {
        res.status(500).json({ message: 'Помилка', error });
    }
});

app.get('/participants/:eventId', requireAuth, async (req, res) => {
    try {
        const participants = await Participant.find({ eventId: req.params.eventId });
        res.json(participants);
    } catch (err) {
        res.status(400).json({ error: "Помилка" });
    }
});

const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    role: String!
  }
  type Event {
    id: ID!
    title: String!
    description: String
    date: String
    creator: ID!
    participants: [Participant]
  }
  type Participant {
    id: ID!
    name: String!
    email: String!
    eventId: ID!
  }
  input AddEventInput {
    title: String!
    description: String
    date: String
  }
  type Query {
    getEvents(limit: Int = 10, skip: Int = 0, search: String, cursor: ID): [Event]
  }
  type Mutation {
    addEvent(input: AddEventInput!): Event
    registerParticipant(eventId: ID!, name: String!, email: String!): Participant
  }
`;

const resolvers = {
  Query: {
    getEvents: async (_, { limit, skip, search, cursor }) => {
      let filter = {};
      if (search) {
        filter.title = { $regex: search, $options: 'i' }; 
      }
      if (cursor) {
        filter._id = { $lt: cursor }; 
      }
      let query = Event.find(filter).sort({ _id: -1 }).limit(limit);
      if (skip) {
        query = query.skip(skip);
      }
      return await query;
    }
  },
  Event: {
    participants: async (parent) => {
      return await Participant.find({ eventId: parent.id });
    }
  },
  Mutation: {
    addEvent: async (_, { input }, context) => {
      if (!context.user) {
        throw new GraphQLError('Не авторизовано', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const newEvent = new Event({
        ...input,
        creator: context.user.id
      });
      return await newEvent.save();
    },
    registerParticipant: async (_, { eventId, name, email }) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new GraphQLError('Помилка email', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      const newParticipant = new Participant({ name, email, eventId });
      return await newParticipant.save();
    }
  }
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

await apolloServer.start();

app.use(
  '/graphql',
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      return { user: req.session.user };
    },
  })
);

app.get('/analytics', async (req, res) => {
    try {
        const participants = await Participant.find({ createdAt: { $exists: true } });

        const counts = {};
        participants.forEach(p => {
            const date = p.createdAt.toISOString().split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });

        const data = Object.keys(counts).map(date => ({
            name: date,
            registrations: counts[date]
        })).sort((a, b) => new Date(a.name) - new Date(b.name)); 

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Помилка завантаження аналітики" });
    }
});

httpServer.listen(PORT, () => {
    console.log(`Сервер працює на порті ${PORT}`);
});
