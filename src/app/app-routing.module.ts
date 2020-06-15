import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth-guard.service';
import { LoginComponent } from './login/login.component';
import { MachineLearningDemoComponent } from './machine-learning-demo/machine-learning-demo.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/ml-demo',
    pathMatch: 'full'
  },
  {
    path: 'ml-demo',
    component: MachineLearningDemoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
