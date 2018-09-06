# Quickstart #

### Install requiremens ###
- Install nodejs
- Install npm packages with `npm install`
- Install contracts with `truffle install`

### Prepare configuration ###
- Get api key from [Infura.io](https://infura.io/)
- Generate keys and addresess with `npm run generate`
- Create .env file from .env-example

### Deploy contracts to rinkeby ###
- Compile contracts with `truffle compile`
- Deploy contracts to rinkeby network `truffle migrate --network rinkeby`
- Update .env with new BDBADAPTERADDRESS

### Execute transfer ###
- Run transfer with `npm run start`