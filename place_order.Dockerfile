# Use a Node.js base image
FROM node:14

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
# COPY customer_app/package*.json ./

# Install dependencies
COPY package*.json ./
RUN npm install 

# Copy the rest of the application code
COPY ./customer_app/ ./

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["node", "place_order.js"]



