[![Build Status](https://travis-ci.org/Ephec-AIR/api.svg?branch=master)](https://travis-ci.org/Ephec-AIR/api)
[![Code coverage](https://codecov.io/gh/Ephec-AIR/api/branch/master/graph/badge.svg)](https://codecov.io/gh/Ephec-AIR/api/branch/master)
## AIR
### REST api for AIR. 

### Installation
> You need node 8.9.3 or higher in order to run this api https://nodejs.org/en/    
> You need mongdb in order to run this api https://www.mongodb.com/     

> clone the repo
```
git clone https://github.com/Ephec-AIR/api.git
```

> install dependencies
```
cd api
npm install
```

> Bonus: MongoDB can be painful to install. If you have docker, you can use it as an alternative
```
docker run --rm -d --name mongodb mongo
```

### Usage
> development
```
npm run start
```

> run tests
```
npm run test
```

> production
```
npm run prod
```

> inject fake data
```
node seed-node.js
```


### Doc

[See our wiki](https://github.com/Ephec-AIR/api/wiki/Endpoint)

### Tech
- Node
- MongoDB
- Jest

