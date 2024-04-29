import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./views/pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
  path: 'dashboard',  
  canActivate: [authGuard], 
  loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
  },
  {
    path: '404',
    loadComponent: () => import('./views/pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./views/pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
];
