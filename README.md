<a href="https://declare-ai.org">declare-ai.org</a> - Declare How You Use Generative AI

This repo contains the source.

## Running Locally

1. Install Docker
2. Clone this repo
3. Inside where you cloned, build a Docker image where you can run the server locally:

   ```
   dx/build
   ```
4. Next, start up a container using the image you just built:

   ```
   dx/start
   ```
5. Once you've done that, install dev tools inside the running container:

   ```
   dx/exec bin/setup
   ```

6. Now, run the dev script which will serve up the site and rebuild on changes:

   ```
   dx/exec bin/dev
   ```

7. View the site locally at `localhost:9998`
8. If you make changes to `src/` or `js/`, you will see a rebuild and a restart of the server.

