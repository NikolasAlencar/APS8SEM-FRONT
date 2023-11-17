import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NewHomeRoutingModule } from './new-home-routing.module';
import { NewHomeComponent } from './new-home.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [NewHomeComponent],
  imports: [
    CommonModule,
    NewHomeRoutingModule,
    FormsModule,
    CarouselModule,
    MatProgressSpinnerModule
  ]
})
export class NewHomeModule { }
