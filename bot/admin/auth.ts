import { wait } from '../../util/time.ts';

type AdminManagerOptions = {
  sessionId: string;
};

export class AdminManager {
  private adminSessionId: string;
  private adminPasswordHash: string | null = null;

  constructor({ sessionId }: AdminManagerOptions) {
    this.adminSessionId = sessionId;
  }

  public get ready() {
    return !!this.adminPasswordHash;
  }

  public async setPassword(password: string) {
    if (this.ready) throw new Error('Password already set');
    this.adminPasswordHash = await Bun.password.hash(password);
  }

  public async verify(password: string) {
    const hashCreated = await wait(() => this.ready, 10000);
    if (!hashCreated || !this.adminPasswordHash) throw new Error('Admin hash not created');

    return await Bun.password.verify(password, this.adminPasswordHash);
  }
}
