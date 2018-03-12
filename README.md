# cache-everything-redis #
Cache every function with Redis 

## Motivation ##
I've seen many caching tools using Redis that do different things. But why install a separate caching tool for every scenario, when you can simply run **every function** you want through a Redis cache? 

**cache-everything-redis** makes it simple as a cake. 


## Quickstart for the impatient ##
Just install this module and run your favourite function that needs a cached output like this:

```
import * as cache from 'cache-everything-redis'
const uriToGet = "https://some-very-slow-api.com"
```
 
This function takes ages to complete because of slow API server... 
On my server response time is 300ms

```
async function mySlowFunction(uriToGet, uriParam){
  return await request({
    uri: uriToGet + uriParam,
    method: "GET"
   })
}
```

Why not run it through a Redis cache? It's simple with **cache-everything-redis**:
```
const myCachedFunction = cache(mySlowFunction, redisClientOpts, redisCacheTTL, [redisCachePrefix])
const superFastResult = await myCachedFunction(uriToGet, uriParam)
````
WOW, now I've got the response in just 5ms

You can run just about any _async_ function through this Redis cache.  