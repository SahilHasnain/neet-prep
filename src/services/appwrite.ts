/**
 * Appwrite Client Service
 * Initializes and exports Appwrite client instances
 */

import { Account, Client, Databases } from "appwrite";
import { APPWRITE_CONFIG, DATABASE_ID } from "../config/appwrite.config";

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Export service instances
export const databases = new Databases(client);
export const account = new Account(client);

export { client, DATABASE_ID };
