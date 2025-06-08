// Type definitions for passport-fitbit-oauth2
// This file provides type definitions for the passport-fitbit-oauth2 package
// which doesn't have official TypeScript typings

/// <reference types="express" />

declare module 'passport-fitbit-oauth2' {
  import { Strategy as OAuth2Strategy } from 'passport-oauth2';

  export interface FitbitProfile {
    id: string;
    displayName: string;
    name: {
      familyName: string;
      givenName: string;
    };
    _json: {
      user: {
        age: number;
        ambassador: boolean;
        avatar: string;
        avatar150: string;
        avatar640: string;
        country: string;
        dateOfBirth: string;
        displayName: string;
        encodedId: string;
        firstName: string;
        fullName: string;
        gender: string;
        height: number;
        lastName: string;
        memberSince: string;
        offsetFromUTCMillis: number;
        state: string;
        strideLengthRunning: number;
        strideLengthWalking: number;
        timezone: string;
        weight: number;
        email?: string;
      };
    };
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    authorizationURL?: string;
    tokenURL?: string;
    userProfileURL?: string;
  }

  // Define error type for OAuth callbacks
  export type VerifyError = Error | null;

  // Define the type for the verify callback
  export type VerifyCallback = (
    error: VerifyError,
    user?: Express.User,
    info?: { message: string } | string
  ) => void;

  // Define the request type
  export interface AuthenticateRequest extends Express.Request {
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  }

  // Define options for authenticate method
  export interface AuthenticateOptions {
    session?: boolean;
    successRedirect?: string;
    failureRedirect?: string;
    assignProperty?: string;
    [key: string]: unknown;
  }

  export class Strategy extends OAuth2Strategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: FitbitProfile,
        done: VerifyCallback
      ) => void
    );

    userProfile(
      accessToken: string,
      done: (error: VerifyError, profile?: FitbitProfile) => void
    ): void; // Add the missing authenticate method to satisfy the Passport Strategy interface
    authenticate(req: AuthenticateRequest, options?: AuthenticateOptions): void;
  }
}
