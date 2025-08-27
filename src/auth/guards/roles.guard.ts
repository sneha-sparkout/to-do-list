import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { UserRole } from "src/common/roles.enum";

@Injectable()

export class RolesGuard implements CanActivate {
    constructor ( private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [context.getHandler(), context.getClass()])
        const { user } = context.switchToHttp().getRequest()
        const hasRequiredRoles = requiredRoles.some((role) => user.role === role)
        return hasRequiredRoles;
        
    }
}