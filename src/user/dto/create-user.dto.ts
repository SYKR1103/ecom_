import { Provider } from "../entities/provide.enum";

export class CreateUserDto {
  nickname: string;
  email: string;
  password ?: string;
  provider : Provider;

}
