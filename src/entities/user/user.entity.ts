export class User {
  private _password: string;

  constructor(
    private readonly _email: string | null,
    private readonly _name: string | null,
    private readonly _telegramId: number | null,
    passwordHash?: string
  ) {
    if (passwordHash) {
      this._password = passwordHash;
    }
  }

  get telegramId(): number | null {
    return this._telegramId;
  }

  get email(): string | null {
    return this._email;
  }

  get name(): string | null {
    return this._name;
  }

  get password(): string | null {
    return this._password;
  }
}
