## air 
### GraphQL api for A.I.R. 

### Usage
```
git clone https://github.com/Ephec-AIR/api.git
```

```
npm run start
```

Run tests
```
npm run test
```

Production
```
npm run prod
```

### GraphQL
You can use your favorite graphql client to consume data (Relay, Apollo, Graphene,...).

Or you can use simple http request. Here's an example with fetch.

```js
const response = await fetch('https://my-graphql-api.com/graphql', {
  method: 'POST',
  headers: { 
    "Content-type": "application/json", 
    "Accept": "application/json"
  },
  body: JSON.stringify({
    "query": "{allFilms {totalCount}}", 
    "variables": null
  })
});

const data = await response.json();
```

### GraphiQL
In dev mode `(npm run start)` you can go to `localhost:3000/graphql-ui` and use graphiql to test queries/mutations/subscribtions.

### Doc
Because graphql use a single endpoint, there's not that much documentation than for REST api. 
However, if you need to know what kind of query/mutation/subscribtion you can do, run the api in dev mode `(npm run start)` go to `localhost:3000/graphql-ui` and click on `docs`. 
Yes graphql api are self-documented.

### Tech
- Node
- GraphQL
- MongoDB
- Redis (sessions)
