FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port Vite
EXPOSE 5173

# Démarrer en développement avec host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]