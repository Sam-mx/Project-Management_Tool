# src/server/Dockerfile
FROM node:18

WORKDIR /server

# Create the directory for your models and set permissions
RUN mkdir -p ./models/prioritization-model && chown -R node:node ./models

# Copy package.json and package-lock.json first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of your application source code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "run", "start"]