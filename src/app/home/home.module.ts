import { NgModule} from '@angular/core';
import {HomeComponent} from './home.component';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule],
    declarations: [HomeComponent],
    exports: [HomeComponent],
    entryComponents: [],
    providers: []
})
export class HomeModule { }
