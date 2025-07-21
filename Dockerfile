FROM node:22-alpine


# Set working directory
WORKDIR /app

# Copy only package.json and package-lock.json first (for layer caching)
COPY package*.json ./

# Install dependencies with --build-from-source to ensure bcrypt is compiled for the current architecture
RUN npm install 

# Copy the rest of the application
COPY . .

# 👇 Create uploads folder (ensure it exists inside the container)

# Build the app (NestJS -> dist/)
RUN npm run build
# Expose the port that the application listens on.
EXPOSE 5005

# Run the application.
CMD ["npm", "run", "start:prod"]
