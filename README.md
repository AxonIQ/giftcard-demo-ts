# Gift Card - demo application 

A demo application written in [TypeScript](https://www.typescriptlang.org/) and [NestJS](https://nestjs.com/), using [Axon Synapse](https://library.axoniq.io/synapse-quick-start/development/index.html) and [Axon Server](https://developer.axoniq.io/axon-server-enterprise/overview).

Additionally, the application is using [fmodel-ts](https://github.com/fraktalio/fmodel-ts) to implement [CQRS](https://martinfowler.com/bliki/CQRS.html) and [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html) patterns effectively.

It focuses around a simple giftcard domain, designed to show robust implementation of DDD/CQRS/ES concepts.

## The structure of the application
A bit simplified, this architectural style is characterized by two key architectural attributes:

 - There is a core with the core business logic, and a shell that handles interactions with the outside world, such as persisting data in databases or providing UIs to interact with end users.
 - The shell can call the core, but the core cannot call the shell and the core is even unaware of the existence of the shell. This is also known as the Dependency Rule(s).

 - It is similar to `Hexagonal Architecture`, `Ports and Adapters`, `Clean Architecture`, `Onion Architecture` which have these two attributes in common.

In this demo we have categorized the code into three layers:

 - `Domain` - **pure** declaration of the program logic, the core, the inner layer, the part that is not aware of the outside world, the part that is testable in isolation, the part that is reusable.
   - [gift-card.command-handler.ts](src/gift-card/command/gift-card.command-handler.ts) (`command side`)
   - [gift-card.event-handler.ts](src/gift-card/query/gift-card.event-handler.ts) (`query side`)
 - `Application` - orchestrates the execution of the logics, by loading the state from the `Infrastructure / Fetch`, calling the `Domain` logic, and persisting the state back to the `Infrastructure / Save`.
   - [gift-card.command-handler.aggregate.ts](src/gift-card/command/gift-card.command-handler.aggregate.ts) (`command side`)
   - [gift-card.event-handler.materialized-view.ts](src/gift-card/query/gift-card.event-handler.materialized-view.ts) (`query side`)
 - `Adapters/Infrastructure` - infrastructure code, the shell, the outer layer, the part that is aware of the outside world.
   - [gift-card.command-handler.aggregate.controller.ts](src/gift-card/command/gift-card.command-handler.aggregate.controller.ts) (`command side`) - HTTP command subscriber/callback
   - [gift-card.command-gateway.ts](src/gift-card/command/gift-card.command-gateway.ts) (`command side`) - HTTP command publisher
   - [gift-card.event-repository.ts](src/gift-card/command/gift-card.event-repository.ts) (`command side`) - Axon Server event repository
   - [gift-card.event-handler.materialized-view.controller.ts](src/gift-card/query/gift-card.event-handler.materialized-view.controller.ts) (`query side`) - HTTP event subscriber/callback
   - [gift-card.view-state-repository.ts](src/gift-card/query/gift-card.view-state-repository.ts) (`query side`) - In-Memory view state repository
   - [gift-card.controller.ts](src/gift-card/web/gift-card.controller.ts) (`command side + query side`) - HTTP/REST API, facing users

Additionally, the components are split per command and query side of the application. This is CQRS pattern influencing the structure of the application.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running the app in Docker (development mode)

> Please set the correct license in [axoniq.license](axoniq.license).

```bash
docker-compose up -d
```
>To shut it down:
```bash
docker-compose dowv -v
```
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Additionally, check the HTTP `scratch files` that you can run and explore the application:

 - [test.http](test.http)
 - [synapse.http](synapse.http)


## Infrastructure
Run Axon Server, Axon Synapse and Postgres

### Axon Server
 - [Overview](https://developer.axoniq.io/axon-server-enterprise/overview)
 - [Download](https://download.axoniq.io/axonserver/AxonServerEnterprise.zip)
 - [http://localhost:8024/](http://localhost:8024/)

### Axon Synapse
 - [Installation instructions](https://library.axoniq.io/synapse-quick-start/development/installation.html)
 - [Download](https://download.axoniq.io/axonserver/axon-synapse.zip)
 - [http://localhost:8080/](http://localhost:8080/)

### Postgres
 - [Download](https://www.postgresql.org/download/)
 - [http://localhost:5432/](http://localhost:5432/)
 - docker
   - `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres`

### Fmodel-ts
 - [github](https://github.com/fraktalio/fmodel-ts)
 - [npm](https://www.npmjs.com/package/@fraktalio/fmodel-ts)


---

Created with :heart: by [AxonIQ](http://axoniq.io)

[axon]: https://axoniq.io/





