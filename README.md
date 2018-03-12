# cache-everything-redis #
Cache every function with Redis 

## Motivation ##
I've seen many caching tools using Redis that do different things. But why install a separate caching tool for every scenario, when you can simply run **every function** you want through a Redis cache? 

**cache-everything-redis** makes it simple as a cake. 


## Requirements ##
This module requires a running Redis server

## Quickstart for the impatient ##
Slow async function situation:

```
const uriToGet = "https://some-very-slow-api.com"
async function mySlowFunction(uriToGet, uriParam){
  return await request({
    uri: uriToGet + uriParam,
    method: "GET"
   })
}
```
This function takes ages to complete because of the slow API server and in my case the response time is 300ms.
Why not speed things up with Redis?


```
import { cache } from 'cache-everything-redis'
const redisClientOpts = { 
  "path":"/var/run/redis/redis.sock", // You can also use host and port here. Please check Redis client documentation. Unix sockets are the fastest option though (rougly 20% faster on my local server) 
  "prefix": "my-global-redis-prefix:"
}
const redisCacheTTL = 3600 // How long to store cached items in Redis? Time in seconds
const redisCachePrefix = "cachedFunctionName" // This is not required and if not set your caller function's name will be used. To be on the safe side and avoid name collisions, provide the safe, unique name here
```

Now, let's make our slow function super-fast by creating it's cached version:
```
const myCachedFunction = cache(mySlowFunction, redisClientOpts, redisCacheTTL, [redisCachePrefix])
const superFastResult = await myCachedFunction(uriToGet, uriParam)
````
WOW, now I've got the response in just 5ms

You can run just about any _async_ function through this Redis cache. You can cache MongoDB queries, API queries, Web requests and just about any async function you can think of.

Enjoy!