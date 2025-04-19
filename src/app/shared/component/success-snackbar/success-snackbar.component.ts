import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, Inject, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
    standalone: true,
    selector: 'app-success-snackbar',
    templateUrl: './success-snackbar.component.html',
    styleUrls: ['./success-snackbar.component.scss'],
    imports: [MatIconModule],
    encapsulation: ViewEncapsulation.None,
})
export class SuccessSnackbarComponent {
    snackBarRef = inject(MatSnackBarRef);
    constructor(
        @Inject(MAT_SNACK_BAR_DATA)
        public data: { mainMsg: string; subMsg: string }
    ) {}
}
