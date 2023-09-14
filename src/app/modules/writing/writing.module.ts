import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WritingComponent } from './writing.component';
import { WritingRoutingModule } from './writing-routing.module';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { WritingContentComponent } from './writing-content/writing-content.component';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [WritingComponent, NavBarComponent, WritingContentComponent],
    imports: [
        FormsModule,
        CommonModule,
        WritingRoutingModule,
        MatIconModule,
    ]
})
export class WritingModule { }