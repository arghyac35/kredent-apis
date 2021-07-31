## Installation

We use `node` version `16.x`

1. Download and install proper nodejs version as said above. Go to the below link:

```
https://nodejs.org/dist/latest-v16.x/
```

2. Clone the repo

```
git clone https://github.com/arghyac35/kredent-apis.git

cd kredent-apis
```

3. The first time, you will need to run

```
npm install
```

4. Copy the environment variables template file

```
cp .env.template .env
```

5. Configure the environment variables

   - Now replace the placeholder values in this file with your values.

6. Then just start the server with

```
npm run start
```

It uses nodemon for livereloading ✌🏻

**If u see errors regarding python then run**

```
npm install --global --production windows-build-tools --vs2015
```

#### Important note

_If you run this command without any additional flags, you’ll install the files associated with the latest version of Visual Studio, which is VS2017 at the time of writing. However, node-gyp requires the v140 distributable, not the v150 (which comes with VS2017). This is why the --vs2015 flag is added to the end of the command, since that’s the last version of Visual Studio that came with the v140 package. You can see more notes about that near the bottom of the package’s wbsite._

_Hopefully, that’s all it will take for you to get everything installed._

# API Validation

By using celebrate the req.body schema becomes clary defined at route level, so even frontend devs can read what an API endpoint expects without need to writting a documentation that can get outdated quickly.

```js
route.post(
  '/signup',
  celebrate({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    }),
  }),
  controller.signup,
);
```

**Example error**

```json
{
  "errors": {
    "message": "child \"email\" fails because [\"email\" is required]"
  }
}
```

[Read more about celebrate here](https://github.com/arb/celebrate) and [the Joi validation API](https://github.com/hapijs/joi/blob/v15.0.1/API.md)

# Roadmap

TODO

# FAQ

TODO
