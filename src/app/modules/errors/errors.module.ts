import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorsComponent } from './errors.component';
import { ErrorsRoutingModule } from './errors-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
    declarations: [ErrorsComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatProgressBarModule,
        ErrorsRoutingModule
    ]
})
export class ErrorModule { }