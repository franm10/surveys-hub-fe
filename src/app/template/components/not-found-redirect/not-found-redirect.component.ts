import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-redirect',
  standalone: false,
  templateUrl: './not-found-redirect.component.html',
  styleUrl: './not-found-redirect.component.scss'
})
export class NotFoundRedirectComponent implements OnInit {

    constructor(private router: Router) {}

    ngOnInit(): void {
        setTimeout(() => this.router.navigateByUrl('/'), 5000);
    }
}
