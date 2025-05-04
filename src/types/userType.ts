import { Role } from 'src/enums/role.enum';

export interface JwtUser {
    id: string,
    email: string,
    role: Role,
}