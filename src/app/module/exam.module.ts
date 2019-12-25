import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExamComponent} from '../exam/exam.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../helper/auth-guard';
import {DoExamComponent} from '../do-exam/do-exam.component';

const routing: Routes = [{
  path: '',
  component: ExamComponent,
  canActivate: [AuthGuard]
}, {
  path: 'do-exam/:id',
  component: DoExamComponent,
  canActivate: [AuthGuard]
}];

@NgModule({
  declarations: [
    ExamComponent,
    DoExamComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routing)
  ]
})
export class ExamModule {
}
