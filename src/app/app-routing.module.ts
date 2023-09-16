import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{
		path: '',
		redirectTo: 'user/write',
		pathMatch: 'full',
	},
	{
		path: 'user/write',
		loadChildren: () => import('./modules/writing/writing.module').then(m => m.WritingModule),
	},
	{
        path: '**',
        loadChildren: () => import('./modules/errors/errors.module').then(m => m.ErrorModule),
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
