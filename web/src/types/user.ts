export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  joinedAt: Date;
}

export interface UserProfile extends User {
  interests?: string[];
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}
