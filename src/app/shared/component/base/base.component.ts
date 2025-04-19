import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl } from '@angular/forms';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null): boolean {
        const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
        const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);

        return invalidCtrl || invalidParent;
    }
}
@Injectable()
export abstract class BaseComponent implements OnDestroy {
    // tslint:disable-next-line:variable-name
    matcher = new MyErrorStateMatcher();
    public _subscription = new Subscription();
    public loading: {
        [key: string]: boolean;
    } = {};
    public ngDestroyed$ = new Subject();
    public ngOnDestroy() {
        this._subscription.unsubscribe();
        this.ngDestroyed$.next(null);
        this.ngDestroyed$.unsubscribe();
    }
}
