import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastr: ToastrService) {
  }

  showSuccess(message, title) {
    this.toastr.success(message, title, {
      enableHtml: true,
      timeOut: 500
    });
  }

  showError(message, title) {
    this.toastr.error(message, title, {
      enableHtml: true,
      timeOut: 500
    });
  }
}
