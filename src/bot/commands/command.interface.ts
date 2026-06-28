export interface ICommand {
  name: string;
  desc: string;
  category: string;
  onlyGroup?: boolean;
  exec: (sock: any, from: string, args: string[], msg?: any) => Promise<void>;
}
