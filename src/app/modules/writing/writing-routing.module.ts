import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WritingComponent } from './writing.component';

const routes: Routes = [
    {
        path: '',
        component: WritingComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WritingRoutingModule { }