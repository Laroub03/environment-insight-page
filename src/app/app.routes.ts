import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authGuard } from "./guards/auth.guard";
import  { LoginComponent } from './views/pages/login/login.component'
import { DashboardComponent } from './views/dashboard/dashboard.component';


export const routes: Routes = [
  { path: "signin", component: LoginComponent },
  { path: "dashboard", component: DashboardComponent, canActivate: [authGuard] },
  { path: "", redirectTo: "/signin", pathMatch: "full" },
];