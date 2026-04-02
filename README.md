Підсумкова практична робота

Ця система складається з двох окремих репозиторіїв:
**Frontend:** [https://github.com/Maxim7548/PrakFrontEnd]
**Backend:** [https://github.com/Maxim7548/event-gallery-backend]

## Технології
* **Frontend:** React, Redux Toolkit, Recharts (для аналітики).
* **Backend:** Node.js, Express, Apollo GraphQL, Socket.io (для чату).
* **База даних:** MongoDB (Mongoose).
* **Безпека:** bcrypt, express-session.

## Встановлення та запуск 

Оскільки проєкт розділений на два репозиторії, вам потрібно завантажити та запустити їх окремо.

### Крок 1: Запуск Backend (Сервер API)
1. Склонуйте цей репозиторій (бекенд):
   ```bash
   git clone [https://github.com/Maxim7548/event-gallery-backend]
   cd [event-gallery-backend]
   ```
2. Встановіть залежності:
   ```bash
   npm install
   ```
3. Створіть файл `.env` у корені папки бекенду та додайте змінні:
   ```env
   PORT=3000
   MONGO_URL=ваше_посилання_на_mongodb
   SESSION_SECRET=ваш_секретний_ключ_для_сесій
   ```
4. Запустіть сервер:
   ```bash
   npm run dev
   ```

### Крок 2: Запуск Frontend (Клієнт)
1. Відкрийте новий термінал та склонуйте репозиторій фронтенду:
   ```bash
   git clone [https://github.com/Maxim7548/PrakFrontEnd]
   cd [PrakFrontEnd]
   ```
2. Встановіть залежності:
   ```bash
   npm install
   ```
3. Запустіть клієнтський додаток:
   ```bash
   npm run dev
   ```

## Деплой (Жива версія)
* **Frontend** розгорнуто на Vercel: [https://vercel.com/new/maxim7548s-projects/success?developer-id=&external-id=&redirect-url=&branch=main&deploymentUrl=prak-front-k4laemwbp-maxim7548s-projects.vercel.app&projectName=prak-front-end&s=https%3A%2F%2Fgithub.com%2FMaxim7548%2FPrakFrontEnd&gitOrgLimit=&hasTrialAvailable=1&totalProjects=1&flow-id=EO-ZZqWb6Ubp0myJeKt9n]
* **Backend** розгорнуто на Render: [https://dashboard.render.com/web/srv-d76n8j94tr6s73cf8q7g/deploys/dep-d775o2p5pdvs73bitoi0?r=2026-04-02%4012%3A06%3A40%7E2026-04-02%4012%3A09%3A29]