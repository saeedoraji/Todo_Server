# Use an official Node.js runtime as a parent image
FROM node:8.6.0

# Maintainer docker repos
MAINTAINER Saeed Oraji <saeedoraji@gmail.com>
# Set the working directory to /
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

# Install any needed packages specified in package.json
RUN npm i

# Make port 3012 available to the world outside this container
EXPOSE 3012

# Define environment variable
ENV NAME World

# Run app.js when the container launches
CMD ["npm", "start"]
