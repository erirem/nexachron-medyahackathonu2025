/**
 * User entity representing the users table
 * Core domain entity for user management
 */

export class UserEntity {
  id: string;
  email: string;
  username?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<UserEntity>) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.username = data.username;
    this.city = data.city;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Get user's display name
   */
  getDisplayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.username || this.email.split('@')[0];
  }

  /**
   * Check if user has complete profile
   */
  hasCompleteProfile(): boolean {
    return !!(this.username && this.city);
  }

  /**
   * Get user's initials
   */
  getInitials(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName[0]}${this.lastName[0]}`.toUpperCase();
    }
    if (this.username) {
      return this.username.substring(0, 2).toUpperCase();
    }
    return this.email.substring(0, 2).toUpperCase();
  }
}

export interface CreateUserData {
  id: string;
  email: string;
  username?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  username?: string;
  city?: string;
  firstName?: string;
  lastName?: string;
}
