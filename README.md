
# Stylus Playground

Stylus Playground is an online tool for building, compiling and testing Stylus smart contracts. Through Stylus Playground developers can explore Arbitrum Stylus without installing cargo packages and writing test scripts. It provides an easily accessible development environment.

It started as a hackathon project at ETH Global Istanbul. Took the first place on Arbitrum Stylus track. Here you can find the project submission [link](https://ethglobal.com/showcase/stylus-playground-qchi4).

### How to use it?

- Open the application https://stylus-playground.vercel.app/
- Click on the **New Project** and start a Hello World Stylus Rust project
- Edit the code through the IDE
- Click on the **Compile** button to compile the code and view compilation results on the bash component
- Click on the **Deploy** button to deploy the compiled contract
- Test the deployment through provided UI components

### Development Roadmap

#### Scalable Server

Stylus Playground uses a server for compiling contracts, exporting the ABI and deploying them to a local test node running on the server. Building a scalable server includes shortening the duration of compilation, deployment and exporting ABI.

#### Client

Client side development includes building required development environment and testing functionalities. Serving for multiple files, sytax highlighting, providing multiple wallets for user to interact with the contract, deploying contracts to live testnet, more flexible UI components for interacting with deployments, saving former deployments and having a better design are to-dos for this stage.

### Further Development

- Supporting multiple programming languages such as C, C++
- Running the VM on the browser so that users will not need to interact with the server while testing deployments.


## Run Locally

Follow instructions to run a local Stylus dev node at https://docs.arbitrum.io/stylus/how-tos/local-stylus-dev-node

Clone the project

Go to server directory

Intall dependencies
```
npm install
```

Generate a .env file based on the template and add the running node directory
```
NODE_DIR=<path to running node directory>
```

Run the server
```
npm run server-start
```

Go to client directory

Intall dependencies
```
npm install
```

Run the client 
```
npm start
```
