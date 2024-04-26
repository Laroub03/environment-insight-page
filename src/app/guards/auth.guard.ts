import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from "@angular/router";
import { LoginService } from "../services/login.service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const auth = inject(LoginService);
  const router = inject(Router);

  if (auth.isLoggedInAdmin()) {
    return true;
  } else {
    router.navigate(["/rankings"]);
    return false;
  }
};
