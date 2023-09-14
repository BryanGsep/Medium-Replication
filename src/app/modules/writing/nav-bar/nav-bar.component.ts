import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-nav-bar',
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
    @Input() userName = 'User Name';
    @Input() writingStatus = 'Not Save Yet';
    @Input() userAvatarUrl = '';
}
