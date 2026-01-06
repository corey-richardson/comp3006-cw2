> docker-compose up

Hello, my name is Corey Richardson. This video will detail the implementation of my COMP3006 Coursework Two Submission; a Social Media System built on the MERN stack, which is containerised using Docker.

There are three services orchestrated by my docker-compose file: a React frontend, a Node.js and Express backend, and a MongoDB replica set database, which allows me to use transactions for atomic data operations.

> Three instances: Login, Global Feed, Following Feed

Authentication was implemented using JSON Web Tokens, and a requireAuth middleware protects API routes from unauthorised access.

> Log in

One of the Must-Have functional requirements, was the use of WebSockets to facilitate real-time updates. Watch the Global feed in the middle as I create a new post on the left.

> Create post, shows on global but not following

CRUD operations are full functional. I can Create, Read, Update and Delete posts, and each of these actions is reflected live across instances. Like and comment counts also update live.

> Delete post, edit post, like/comment on post

Using Socket.io and the React Context API with reducer functions, the post is broadcast from the database controllers on the server, detected by the frontend and added into state without the need for a page refresh. Conditional logic gates in the ADD_POST reducer mean that posts will only appear in the context they should appear in. All posts from any user are added to the state of the global feed, only posts that the user follows are added to state for the following feed, ...

> Profile page

...and a username match check is performed when on the profile page. This conditional logic prevents state corruption.

---

> Switch to VS Code and `npm run test:coverage` or Testing extension

I implemented Unit and Integration tests with Vitest and Supertest. Each test uses the Arrange-Act-Assert pattern to ensure that tests have a single, atomic responsibility.

I haven't achieved 100% test coverage, but I have prioritised high-complexity areas, as well as making sure each "type" of file has been tested, such as controller files testing each of the CRUD operation types, utility files, authentication middleware, and reducer functions to demonstrate the knowledge.

My Post Reducer function has 100% statement coverage, verifying that my real-time filtering logic works as expected. On the backend, I used Supertest to simulate HTTP requests, allowing the requireAuth middleware and controller transactions flow to be tested from end-to-end.

---

> Switch to diagram showing code quality pipeline

My code quality checks follow a "Shift-Left" approach. Locally, I used Husky to set up a git pre-commit hook, which runs ESLint to enforce style rules. If this check fails, the commit is aborted and the substandard code isn't added to the repository.

> Switch to to GitHub Actions page

My GitHub Actions workflow has three jobs. First, it again runs the linting rules to ensure that local rules haven't been bypassed. Only when this job succeeds do my frontend and backend tests runs in parallel.

The pipeline runs on the same container at all stages ensuring environment parity between my local Docker development containers and a production-ready build.

> Show Artifacts

Coverage reports are uploaded for every test run, allowing me to review failures as needed.

---

> Return to app, scroll through global

In summary, I have successfully met my Functional and Non-Functional requirements to provide a live real-time Social Media system, providing a seamless User Experience, backed by my use of automated test cases and a DevOps pipeline.

Thank you.
