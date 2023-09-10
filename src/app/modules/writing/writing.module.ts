import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WritingComponent } from './writing.component';
import { WritingRoutingModule } from './writing-routing.module';


@NgModule({
    declarations: [WritingComponent],
    imports: [
        CommonModule,
        WritingRoutingModule
    ]
})
export class WritingModule { }