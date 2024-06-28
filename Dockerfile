# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install the app dependencies using pnpm
RUN pnpm install

# Copy the rest of the app files to the working directory
COPY . .

# Build the Remix app using pnpm
RUN pnpm run build

# Expose port 3000 for the app to listen on
EXPOSE 3000

# Define the command to run the app using pnpm
CMD ["pnpm", "start"]