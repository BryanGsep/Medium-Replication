import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss']
})
export class ErrorsComponent implements OnInit {
	public percent = 0;

    ngOnInit(): void {
        this.countDown();
    }

    countDown(): void {
        interval(100).subscribe(() => {
            this.percent += 2;
            if (this.percent >= 100) {
                window.location.href = '/';
            }
        });
    }
}
