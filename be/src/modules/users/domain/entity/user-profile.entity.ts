export class UserProfile {
  private constructor(
    public id: number | null,
    public userId: number,
    public avatarUrl: string | null,
    public gender: number | null,
    public firstName: string | null,
    public lastName: string | null,
    public phone: string | null,
    public dateOfBirth: Date | null,
    public address: string | null,
    public country: string | null,
    public city: string | null,
    public occupation: string | null,
    public bio: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  static create(params: {
    userId: number;
    avatarUrl?: string | null;
    gender?: number | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    dateOfBirth?: Date | null;
    address?: string | null;
    country?: string | null;
    city?: string | null;
    occupation?: string | null;
    bio?: string | null;
  }): UserProfile {
    return new UserProfile(
      null,
      params.userId,
      params.avatarUrl ?? null,
      params.gender ?? null,
      params.firstName ?? null,
      params.lastName ?? null,
      params.phone ?? null,
      params.dateOfBirth ?? null,
      params.address ?? null,
      params.country ?? null,
      params.city ?? null,
      params.occupation ?? null,
      params.bio ?? null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    userId: number;
    avatarUrl: string | null;
    gender: number | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    country: string | null;
    city: string | null;
    occupation: string | null;
    bio: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): UserProfile {
    return new UserProfile(
      params.id,
      params.userId,
      params.avatarUrl,
      params.gender,
      params.firstName,
      params.lastName,
      params.phone,
      params.dateOfBirth,
      params.address,
      params.country,
      params.city,
      params.occupation,
      params.bio,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: {
    avatarUrl?: string | null;
    gender?: number | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    dateOfBirth?: Date | null;
    address?: string | null;
    country?: string | null;
    city?: string | null;
    occupation?: string | null;
    bio?: string | null;
  }): void {
    if (params.avatarUrl !== undefined) {
      this.avatarUrl = params.avatarUrl;
    }

    if (params.gender !== undefined) {
      this.gender = params.gender;
    }

    if (params.firstName !== undefined) {
      this.firstName = params.firstName;
    }

    if (params.lastName !== undefined) {
      this.lastName = params.lastName;
    }

    if (params.phone !== undefined) {
      this.phone = params.phone;
    }

    if (params.dateOfBirth !== undefined) {
      this.dateOfBirth = params.dateOfBirth;
    }

    if (params.address !== undefined) {
      this.address = params.address;
    }

    if (params.country !== undefined) {
      this.country = params.country;
    }

    if (params.city !== undefined) {
      this.city = params.city;
    }

    if (params.occupation !== undefined) {
      this.occupation = params.occupation;
    }

    if (params.bio !== undefined) {
      this.bio = params.bio;
    }

    this.updatedAt = new Date();
  }
}