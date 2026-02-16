# Use official Node image
FROM node:20

# Create app directory inside container
WORKDIR /app

# Copy package.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Expose port (change if your app uses another port)
EXPOSE 4500

# Start the app
CMD ["npm", "start"]
