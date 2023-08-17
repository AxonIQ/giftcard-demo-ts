import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, retry, tap } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

/**
 * *** ADAPTER LAYER ***
 * ___
 * A generalized Axon Client
 */
@Injectable()
export class AxonClient<C, E, Q> {
  private readonly logger = new Logger(AxonClient.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fetch events for a given aggregate command
   * @param c - aggregate command
   * @param aggregateIdProvider - aggregate id provider / a function that returns aggregate id from the aggregate command
   * @param context - context name
   */
  async fetchAggregateEvents(
    c: C,
    aggregateIdProvider: (c: C) => string,
    context = this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<[E, number][]> {
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const { data } = await firstValueFrom(
      this.httpService
        .get<Data>(
          `${axonApiUrl}/contexts/${context}/aggregate/${aggregateIdProvider(
            c,
          )}/events`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    return data.items.map((it) => [it.payload as E, it.sequenceNumber]);
  }

  /**
   * Append an event to the Axon Server event store
   * @param e - event
   * @param aggregateIdProvider - aggregate id provider / a function that returns aggregate id from the event
   * @param aggregateTypeProvider -aggregate type provider / a function that returns aggregate type from the event
   * @param payloadTypeProvider - payload type provider / a function that returns event payload type from the event
   * @param latestVersion - latest version of the aggregate / sequence number of the last event in the aggregate stream
   * @param context - context name
   */
  async appendEvent(
    e: E,
    aggregateIdProvider: (e: E) => string,
    aggregateTypeProvider: (e: E) => string,
    payloadTypeProvider: (e: E) => string,
    latestVersion: number | null,
    context = this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<[E, number]> {
    const event: [E, number] = [
      e,
      latestVersion != null ? latestVersion + 1 : 0,
    ];
    const headersRequest = {
      'Content-Type': 'application/json',
      'AxonIQ-AggregateType': aggregateTypeProvider(e),
      'AxonIQ-AggregateId': aggregateIdProvider(e),
      'AxonIQ-SequenceNumber': event[1],
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const URL = `${axonApiUrl}/contexts/${context}/events/${payloadTypeProvider(
      e,
    )}`;
    await firstValueFrom(
      this.httpService
        .post<[E, number]>(URL, e, { headers: headersRequest })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    return event;
  }

  /**
   * Publish a command to Axon Server
   * @param c - command
   * @param payloadTypeProvider - payload type provider / a function that returns command payload type from the command
   * @param routingKeyProvider - routing key provider / a function that returns routing key from the command
   * @param contextProvider - context provider / a function that returns context name from the command
   */
  async publishCommand(
    c: C,
    payloadTypeProvider: (c: C) => string,
    routingKeyProvider: (c: C) => string,
    contextProvider: (c: C) => string = () =>
      this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<readonly [E, number][]> {
    const headersRequest = {
      'Content-Type': 'application/json',
      'AxonIQ-PayloadType': payloadTypeProvider(c),
      'AxonIQ-RoutingKey': routingKeyProvider(c),
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const URL = `${axonApiUrl}/contexts/${contextProvider(
      c,
    )}/commands/${payloadTypeProvider(c)}`;

    this.logger.debug(
      `dispatching command ${payloadTypeProvider(c)} with body ${JSON.stringify(
        c,
      )}`,
    );
    const { data } = await firstValueFrom(
      this.httpService
        .post<[E, number][]>(URL, c, { headers: headersRequest })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    this.logger.debug(
      `dispatched command ${payloadTypeProvider(c)} with body ${JSON.stringify(
        c,
      )}`,
    );
    return data;
  }

  /**
   * Publish a query to Axon Server
   * @param q - query
   * @param payloadTypeProvider - payload type provider / a function that returns command payload type from the query
   * @param responseTypeProvider - response type provider / a function that returns response type from the query
   * @param responseCardinalityProvider - response cardinality provider / a function that returns response cardinality from the query
   * @param contextProvider - context provider / a function that returns context name from the query
   */
  async publishQuery<QR>(
    q: Q,
    payloadTypeProvider: (q: Q) => string,
    responseTypeProvider: (q: Q) => string,
    responseCardinalityProvider: (q: Q) => string,
    contextProvider: (q: Q) => string = () =>
      this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<readonly QR[] | QR | null> {
    const headersRequest = {
      'Content-Type': 'application/json',
      'AxonIQ-PayloadType': payloadTypeProvider(q),
      'AxonIQ-ResponseType': responseTypeProvider(q),
      'AxonIQ-ResponseCardinality': responseCardinalityProvider(q),
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const URL = `${axonApiUrl}/contexts/${contextProvider(
      q,
    )}/queries/${payloadTypeProvider(q)}`;

    this.logger.debug(
      `dispatching query ${payloadTypeProvider(q)} with body ${JSON.stringify(
        q,
      )}`,
    );
    const { data } = await firstValueFrom(
      this.httpService
        .post<QR[] | QR | null>(URL, q, { headers: headersRequest })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    this.logger.debug(
      `dispatched query ${payloadTypeProvider(q)} with body ${JSON.stringify(
        q,
      )}`,
    );
    return data;
  }

  /**
   * Register an event handler
   * @param handlerId - unique handler id for the event handler registration
   * @param events - list of event names/types to register the handler for
   * @param clientId - client id
   * @param componentName - component name
   * @param route - a relative route to the event handler
   * @param context - context name
   */
  async registerEventHandler(
    handlerId: string,
    events: string[],
    clientId: string,
    componentName: string,
    route: string,
    context = this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<HandlerRegistrationResponse> {
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const callbackEndpoint =
      this.configService.get<string>(
        'AXON_EVENT_CALLBACK_ENDPOINT',
        'http://localhost:3000',
      ) + route;
    const request = {
      names: events,
      endpoint: callbackEndpoint,
      endpointType: 'http-raw',
      clientId: clientId,
      componentName: componentName,
    };
    const URL = `${axonApiUrl}/contexts/${context}/handlers/events/${handlerId}`;
    const { data } = await firstValueFrom(
      this.httpService
        .put<HandlerRegistrationResponse>(URL, request, {
          headers: headersRequest,
        })
        .pipe(
          tap({
            error: (err) =>
              this.logger.error(
                `Unable to register Event Handler (${err.message}). Retrying ...`,
              ),
          }),
          retry({ count: 10, delay: 6000, resetOnSuccess: true }),
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    return data;
  }

  /**
   * Register a command handler
   * @param handlerId - unique handler id for the command handler registration
   * @param commands - list of command names/types to register the handler for
   * @param clientId - client id
   * @param componentName - component name
   * @param route - a relative route to the command handler
   * @param context - context name
   */
  async registerCommandHandler(
    handlerId: string,
    commands: string[],
    clientId: string,
    componentName: string,
    route: string,
    context = this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<HandlerRegistrationResponse> {
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const callbackEndpoint =
      this.configService.get<string>(
        'AXON_COMMAND_CALLBACK_ENDPOINT',
        'http://localhost:3000',
      ) + route;
    const request = {
      names: commands,
      endpoint: callbackEndpoint,
      endpointType: 'http-raw',
      clientId: clientId,
      componentName: componentName,
    };
    const URL = `${axonApiUrl}/contexts/${context}/handlers/commands/${handlerId}`;
    const { data } = await firstValueFrom(
      this.httpService
        .put<HandlerRegistrationResponse>(URL, request, {
          headers: headersRequest,
        })
        .pipe(
          tap({
            error: (err) =>
              this.logger.error(
                `Unable to register Command Handler (${err.message}). Retrying ...`,
              ),
          }),
          retry({ count: 10, delay: 6000, resetOnSuccess: true }),
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    return data;
  }

  /**
   * Register a query handler
   * @param handlerId - unique handler id for the command handler registration
   * @param queries - list of query names/types to register the handler for
   * @param clientId - client id
   * @param componentName - component name
   * @param route - a relative route to the query handler
   * @param context - context name
   */
  async registerQueryHandler(
    handlerId: string,
    queries: string[],
    clientId: string,
    componentName: string,
    route: string,
    context = this.configService.get<string>('AXON_CONTEXT', 'default'),
  ): Promise<HandlerRegistrationResponse> {
    const headersRequest = {
      'Content-Type': 'application/json',
    };
    const axonApiUrl = this.configService.get<string>(
      'AXON_API_URL',
      'http://localhost:8080/v1',
    );
    const callbackEndpoint =
      this.configService.get<string>(
        'AXON_QUERY_CALLBACK_ENDPOINT',
        'http://localhost:3000',
      ) + route;
    const request = {
      names: queries,
      endpoint: callbackEndpoint,
      endpointType: 'http-raw',
      clientId: clientId,
      componentName: componentName,
    };
    const URL = `${axonApiUrl}/contexts/${context}/handlers/queries/${handlerId}`;
    const { data } = await firstValueFrom(
      this.httpService
        .put<HandlerRegistrationResponse>(URL, request, {
          headers: headersRequest,
        })
        .pipe(
          tap({
            error: (err) =>
              this.logger.error(
                `Unable to register Query Handler (${err.message}). Retrying ...`,
              ),
          }),
          retry({ count: 10, delay: 6000, resetOnSuccess: true }),
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message, error.stack);
            throw error;
          }),
        ),
    );
    return data;
  }
}

interface Data {
  items: Item[];
}
interface Item {
  id: string;
  metaData: MetaData;
  payload: object;
  payloadType: string;
  payloadRevision: string;
  name: string;
  aggregateId: string;
  aggregateType: string;
  sequenceNumber: number;
  index: number;
}
interface MetaData {
  'some key': string;
  'another key': string;
}

export interface HandlerRegistrationResponse {
  names: string[];
  endpoint: string;
  endpointType: string;
  endpointOptions: EndpointOption[];
  clientId: string;
  componentName: string;
  loadFactor: number;
  concurrency: number;
  enabled: boolean;
  context: string;
  clientAuthenticationId: string;
  serverAuthenticationId: string;
  id: string;
}

export interface EndpointOption {
  key: string;
  value: string;
}

export const AXONIQ_COMMANDNAME = 'axoniq-commandname';
export const AXONIQ_QUERYNAME = 'axoniq-queryname';
export const AXONIQ_PAYLOADTYPE = 'axoniq-payloadtype';
export const AXONIQ_ROUTINGKEY = 'axoniq-routingkey';
export const AXONIQ_MESSAGEID = 'axoniq-messageid';
export const AXONIQ_EVENTNAME = 'axoniq-eventname';
export const AXONIQ_AGGREGATEID = 'axoniq-aggregateid';
export const AXONIQ_AGGREGATETYPE = 'axoniq-aggregatetype';
export const AXONIQ_SEQUENCENUMBER = 'axoniq-sequencenumber';
